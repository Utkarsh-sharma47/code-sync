import express from "express";
import {
  createSession,
  getActiveSessions,
  getRecentSessions,
  getSessionById,
  joinSession,
  endSession,
} from "../controllers/sessionController.js";
import { getStreamToken } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getRecentSessions);

// get user the session by id
router.get("/:id", protectRoute, getSessionById);
// support both GET (legacy) and POST (current frontend) for joining
router.get("/:id/join", protectRoute, joinSession);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/stream-token", protectRoute, getStreamToken);

export default router;