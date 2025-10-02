import { Server } from "socket.io";
import jwt from "jsonwebtoken";

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CROSS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Unauthorized: No token provided"));
      }

      // Fixed: Use ACCESS_TOKEN_SECRET instead of JWT_SECRET
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Fixed: Use decoded._id instead of decoded.id
      socket.data.user = { 
        id: decoded._id,
        username: decoded.username,
        email: decoded.email
      };
      
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    const username = socket.data.user.username;
    
    console.log(`✅ User connected: ${username} (${userId})`);

    // Join user's personal room
    socket.join(userId);

    // Fixed: Typo - joinRoom instead of joiRoom
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${username} joined room: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit("userJoined", {
        userId,
        username,
        roomId,
        timestamp: new Date(),
      });
    });

    // Handle leaving a room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User ${username} left room: ${roomId}`);
      
      socket.to(roomId).emit("userLeft", {
        userId,
        username,
        roomId,
        timestamp: new Date(),
      });
    });

    // Handle sending messages
    socket.on("sendMessage", (payload) => {
      try {
        const { to, text, chatId } = payload;

        if (!text || text.trim() === "") {
          socket.emit("error", { message: "Message text cannot be empty" });
          return;
        }

        // Create a consistent room identifier
        const room = chatId || [userId, to].sort().join("_");

        const messageData = {
          chatId: room,
          sender: userId,
          senderUsername: username,
          text: text.trim(),
          createdAt: new Date(),
          _id: Date.now().toString(), // Temporary ID until saved in DB
        };

        // Emit to room (including sender)
        io.to(room).emit("newMessage", messageData);
        
        console.log(`Message sent in room ${room}: ${text.substring(0, 30)}...`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (payload) => {
      const { to, chatId } = payload;
      const room = chatId || [userId, to].sort().join("_");
      
      socket.to(room).emit("userTyping", {
        userId,
        username,
        chatId: room,
      });
    });

    socket.on("stopTyping", (payload) => {
      const { to, chatId } = payload;
      const room = chatId || [userId, to].sort().join("_");
      
      socket.to(room).emit("userStoppedTyping", {
        userId,
        username,
        chatId: room,
      });
    });

    // Handle post notifications
    socket.on("likePost", (payload) => {
      const { postId, postOwnerId } = payload;
      
      if (postOwnerId && postOwnerId !== userId) {
        io.to(postOwnerId).emit("postLiked", {
          postId,
          likedBy: userId,
          likedByUsername: username,
          timestamp: new Date(),
        });
      }
    });

    socket.on("commentPost", (payload) => {
      const { postId, postOwnerId, comment } = payload;
      
      if (postOwnerId && postOwnerId !== userId) {
        io.to(postOwnerId).emit("postCommented", {
          postId,
          commentedBy: userId,
          commentedByUsername: username,
          comment,
          timestamp: new Date(),
        });
      }
    });

    // Handle online status
    socket.on("getOnlineUsers", () => {
      const sockets = io.sockets.sockets;
      const onlineUsers = [];
      
      sockets.forEach((s) => {
        if (s.data.user) {
          onlineUsers.push({
            userId: s.data.user.id,
            username: s.data.user.username,
          });
        }
      });
      
      socket.emit("onlineUsers", onlineUsers);
    });

    // Broadcast user online status
    socket.broadcast.emit("userOnline", {
      userId,
      username,
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${username} (${userId})`);
      
      // Broadcast user offline status
      socket.broadcast.emit("userOffline", {
        userId,
        username,
        timestamp: new Date(),
      });
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${username}:`, error);
    });
  });

  // Global error handler
  io.engine.on("connection_error", (err) => {
    console.error("Connection error:", err.message);
  });

  console.log("🚀 Socket.IO initialized successfully");

  return io;
}

export { initSocket };