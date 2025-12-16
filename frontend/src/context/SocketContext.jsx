// frontend/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import api from "../api/axios"; // Import api to fetch initial count

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // <--- New State
  const { user } = useAuth();

  // 1. Initialize Socket
  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: localStorage.getItem("accessToken"),
        },
      });
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  // 2. Fetch Initial Unread Count & Listen for Real-time Updates
  useEffect(() => {
    if (user) {
      // Fetch initial count
      const fetchUnread = async () => {
        try {
          const res = await api.get("/message/unread");
          setUnreadCount(res.data.data.count);
        } catch (err) {
          console.error("Failed to fetch unread count", err);
        }
      };
      fetchUnread();
    }

    if (socket) {
      // Listen for incoming messages
      const handleNewMessage = (msg) => {
        // Only increment if the message is NOT from me
        if (msg.sender !== user._id) {
          setUnreadCount((prev) => prev + 1);
        }
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};