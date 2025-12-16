import { useAuth } from "../../context/AuthContext";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const isMe = message.sender._id === user._id;

  return (
    <div
      className={`max-w-xs p-3 rounded-lg ${
        isMe
          ? "ml-auto bg-blue-500 text-white"
          : "mr-auto bg-gray-300 text-black"
      }`}
    >
      {message.text}
    </div>
  );
}
