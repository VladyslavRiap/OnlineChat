import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { conncetDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.listen(5001, () => {
  console.log("server running on port:" + PORT);
  conncetDB();
});
