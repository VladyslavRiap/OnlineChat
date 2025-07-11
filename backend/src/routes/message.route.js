import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteMessage,
  getLastMessages,
  getMessages,
  getUsersForSideBar,
  markMessageAsRead,
  sendMessage,
  updateMessage,
} from "../controllers/message.controller.js";

import { upload } from "../lib/multer.js";

const router = express.Router();
router.get("/user", protectRoute, getUsersForSideBar);
router.get("/last-messages", protectRoute, getLastMessages);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);
router.patch("/:senderId/read-all", protectRoute, markMessageAsRead);
router.delete("/:id", protectRoute, deleteMessage);
router.patch("/:id", protectRoute, updateMessage);
export default router;
