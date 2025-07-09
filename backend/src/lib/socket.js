import express from "express";
import http from "http";
import { Server } from "socket.io";
import User from "../models/user.model.js";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
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
