import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } });
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSideBar", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const markMessageAsRead = async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.user._id;

    if (!senderId || senderId === receiverId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: `Marked ${result.modifiedCount} messages as read`,
    });
  } catch (error) {
    console.error("Error in markMessageAsRead:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(messageId);

    if (!message || message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can delete only your own message" });
    }

    const { receiverId, senderId, isRead } = message;
    await message.deleteOne();

    const emitDeleteMessage = (targetUserId, socketId) => {
      if (socketId) {
        io.to(socketId).emit("messageDeleted", {
          messageId,
          senderId,
          receiverId,
        });
      }
    };

    const senderSocketId = getReceiverSocketId(senderId);
    emitDeleteMessage(senderId, senderSocketId);

    const receiverSocketId = getReceiverSocketId(receiverId);
    emitDeleteMessage(receiverId, receiverSocketId);

    if (!isRead) {
      const unreadCounts = await Message.aggregate([
        { $match: { receiverId, isRead: false } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]);

      const unreadCountMap = {};
      unreadCounts.forEach((item) => {
        unreadCountMap[item._id.toString()] = item.count;
      });

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("updateUnreadCounts", unreadCountMap);
      }
    }

    const updateLastMessageFor = async (userId, otherUserId) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        const socketId = getReceiverSocketId(otherUserId);
        if (socketId) {
          io.to(socketId).emit("updateLastMessage", {
            userId,
            lastMessage,
          });
        }
      }
    };

    await updateLastMessageFor(senderId, receiverId);
    await updateLastMessageFor(receiverId, senderId);

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error in deleteMessage", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;
    const message = await Message.findById(messageId);
    if (!message || message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    message.text = text;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error("Error in updateMessage", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getLastMessages = async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
        },
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$lastMessage", { userId: "$_id" }],
        },
      },
    },
  ]);

  const mapped = {};
  messages.forEach((m) => {
    mapped[m.userId] = m;
  });

  res.json(mapped);
};

export const getUnreadCounts = async (req, res) => {
  try {
    const receiverId = req.user._id;

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    unreadCounts.forEach((item) => {
      result[item._id.toString()] = item.count;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to get unread counts", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
