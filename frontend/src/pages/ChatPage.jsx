import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

export default function ChatPage() {
  const { conversationId } = useParams();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);

  // 🔹 Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get(`/message/${conversationId}`);
      setMessages(res.data.data);
    };
    fetchMessages();
  }, [conversationId]);

  // 🔹 Receive real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("newMessage");
  }, [socket]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <MessageList messages={messages} />
      <MessageInput
        conversationId={conversationId}
        onMessageSent={(msg) =>
          setMessages((prev) => [...prev, msg])
        }
      />
    </div>
  );
}
