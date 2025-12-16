// backend/src/controllers/Message.controller.js
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";

// Send message
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !text) {
    throw new ApiError(400, "Receiver and message text required");
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    text,
  });

  // Update conversation's last message
  conversation.lastMessage = message._id;
  await conversation.save();

  // Populate sender info before sending response
  await message.populate("sender", "username profilePic");

  // Emit socket event
  const io = req.app.get("io");
  if (io) {
    // Send to specific conversation room
    io.to(conversation._id.toString()).emit("newMessage", message);
    
    // Also send to receiver's personal room
    io.to(receiverId.toString()).emit("newMessage", message);
  }

  return res.status(201).json(
    new ApiResponse(201, message, "Message sent")
  );
});

// Get messages of a conversation
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  // Verify user is part of this conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username profilePic")
    .sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(200, messages, "Messages fetched")
  );
});
// NEW: Get total unread message count for the user
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Message.countDocuments({
    conversation: { $in: await Conversation.find({ participants: userId }).distinct('_id') },
    sender: { $ne: userId }, // Message is not from me
    seen: false              // Message is not seen
  });

  return res.status(200).json(
    new ApiResponse(200, { count }, "Unread count fetched")
  );
});

// NEW: Mark messages in a conversation as read
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      seen: false
    },
    { $set: { seen: true } }
  );

  return res.status(200).json(
    new ApiResponse(200, {}, "Messages marked as read")
  );
});