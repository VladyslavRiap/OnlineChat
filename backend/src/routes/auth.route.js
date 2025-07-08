import express from "express";
import {
  changePassword,
  checkAuth,
  login,
  logout,
  signup,
  updateFullName,
  updateProfile,
  updateUsername,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../lib/multer.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);
router.post("/change-password", protectRoute, changePassword);
router.put(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"),
  updateProfile
);
router.get("/check", protectRoute, checkAuth);
router.put("/update-fullname", protectRoute, updateFullName);
router.put("/update-username", protectRoute, updateUsername);
export default router;
