import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}
    </div>
  );
}
