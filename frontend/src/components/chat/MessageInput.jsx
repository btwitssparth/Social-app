// frontend/src/components/chat/MessageInput.jsx
import { useState } from "react";
import api from "../../api/axios";

export default function MessageInput({
  conversationId, // Kept for reference, but API uses receiverId
  receiverId,     // <--- ADDED: Required by backend
  onMessageSent,
}) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post("/message/send", {
        receiverId, // <--- FIXED: Now sending receiverId
        text,
      });

      const savedMessage = res.data.data;
      onMessageSent(savedMessage);
      setText("");
      
      // Removed socket.emit() to prevent duplicates
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="p-3 flex gap-2 border-t bg-white">
      <input
        className="flex-1 border rounded px-3 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 rounded"
      >
        Send
      </button>
    </div>
  );
}