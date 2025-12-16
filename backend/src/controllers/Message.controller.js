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

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    text,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  return res.status(201).json(
    new ApiResponse(201, message, "Message sent")
  );
});

// Get messages of a conversation
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username profilePic")
    .sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(200, messages, "Messages fetched")
  );
});
