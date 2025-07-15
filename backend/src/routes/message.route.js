import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteMessage,
  getLastMessages,
  getMessages,
  getUsersForSideBar,
  markMessageAsRead,
  sendMessage,
  getUnreadCounts,
  updateMessage,
} from "../controllers/message.controller.js";

import { upload } from "../lib/multer.js";

const router = express.Router();
router.get("/user", protectRoute, getUsersForSideBar);
router.get("/last-messages", protectRoute, getLastMessages);
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);
router.patch("/:senderId/read-all", protectRoute, markMessageAsRead);
router.delete("/:messageId", protectRoute, deleteMessage);
router.patch("/:messageId", protectRoute, updateMessage);
router.get("/unread-counts", protectRoute, getUnreadCounts);
router.get("/:id", protectRoute, getMessages);
export default router;
