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
