// Get all conversations (Inbox)
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "username profilePic")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  const formatted = conversations.map((conv) => {
    const otherUser = conv.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    return {
      _id: conv._id,
      user: otherUser,
      lastMessage: conv.lastMessage,
      updatedAt: conv.updatedAt,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, formatted, "Conversations fetched")
  );
});
