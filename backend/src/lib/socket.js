import express from "express";
import http from "http";
import { Server } from "socket.io";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import Message from "../models/message.model.js";
const app = express();
const server = http.createServer(app);
dotenv.config();
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONT_URL],
  },
});
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
const userSocketMap = {};

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch (err) {
      console.error("❌ Failed to mark user online:", err.message);
    }
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("messagesRead", async ({ senderId }) => {
    const receiverId = userId;
    const receiverSocketId = userSocketMap[receiverId];

    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("updateReadStatus", { userId: receiverId });
    }

    try {
      const unreadCounts = await Message.aggregate([
        { $match: { receiverId, isRead: false } },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
          },
        },
      ]);

      const unreadCountMap = {};
      unreadCounts.forEach((item) => {
        unreadCountMap[item._id.toString()] = item.count;
      });

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("updateUnreadCounts", unreadCountMap);
      }
    } catch (err) {
      console.error("❌ Failed to send unread counts:", err.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("❌ A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];

      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("❌ Failed to update lastSeen:", err.message);
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, io, server };
