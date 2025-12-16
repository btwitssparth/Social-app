// frontend/src/pages/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  
  // Ref for scrolling to bottom
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Fetch conversation details and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get conversation details
        const convRes = await api.get("/conversation");
        const conversation = convRes.data.data.find(
          (c) => c._id === conversationId
        );
        
        if (conversation) {
          const other = conversation.participants.find(
            (p) => p._id !== user._id
          );
          setOtherUser(other);
        }

        // Get messages
        const msgRes = await api.get(`/message/${conversationId}`);
        setMessages(msgRes.data.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && conversationId) {
      fetchData();
    }
  }, [conversationId, user]);

  // Join room and listen for messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("joinRoom", conversationId);

    const handleNewMessage = (msg) => {
      // Prevent duplicates: Check if message already exists
      setMessages((prev) => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", conversationId);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, conversationId]);

  const sendMessage = async () => {
    if (!text.trim() || !otherUser) return;

    try {
      // 1. Send to Backend
      const res = await api.post("/message/send", {
        receiverId: otherUser._id,
        text: text.trim(),
      });

      const savedMessage = res.data.data;
      
      // 2. Add message locally immediately for UI responsiveness
      setMessages((prev) => [...prev, savedMessage]);

      // Note: We REMOVED the redundant socket.emit("sendMessage") here.
      // The backend controller now emits the event to the room upon saving.

      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ... (fetch conversation and otherUser) ...

        // NEW: Mark messages as read
        await api.post(`/message/read/${conversationId}`);
        
        // NEW: Update global unread count (re-fetch to be accurate)
        const countRes = await api.get("/message/unread");
        setUnreadCount(countRes.data.data.count);

        // ... (fetch messages) ...
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conversationId, setUnreadCount]); // Add setUnreadCount to dependencies

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3 shadow-sm">
        <button
          onClick={() => navigate("/messages")}
          className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        {otherUser && (
          <>
            <img
              src={otherUser.profilePic}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{otherUser.username}</h2>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    isMe
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMe ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}