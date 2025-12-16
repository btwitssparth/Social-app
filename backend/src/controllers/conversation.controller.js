import Conversation from "../models/Conversation.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "username profilePic")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, conversations, "Conversations fetched")
  );
});

// backend/src/controllers/conversation.controller.js


export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  // 1. Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  // 2. If not, create a new one
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  return res.status(200).json(
    new ApiResponse(200, conversation, "Conversation retrieved successfully")
  );
});
