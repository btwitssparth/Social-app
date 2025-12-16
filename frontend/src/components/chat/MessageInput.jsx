import { useState } from "react";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";

export default function MessageInput({
  conversationId,
  onMessageSent,
}) {
  const [text, setText] = useState("");
  const socket = useSocket();

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await api.post("/message/send", {
      conversationId,
      text,
    });

    const savedMessage = res.data.data;

    onMessageSent(savedMessage);

    socket.emit("sendMessage", {
      chatId: conversationId,
      text: savedMessage.text,
      to: savedMessage.receiver,
    });

    setText("");
  };

  return (
    <div className="p-3 flex gap-2 border-t bg-white">
      <input
        className="flex-1 border rounded px-3 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
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
