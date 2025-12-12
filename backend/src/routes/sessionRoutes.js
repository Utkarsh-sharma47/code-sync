import express from "express";
import { createSession, getActiveSessions,getRecentSessions, getSessionById, joinSession, endSession
 } from "../controllers/sessionController.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

router.post("/", protectRoute, createSession)
router.get("/active",protectRoute ,getActiveSessions)
router.get("/my-recent", protectRoute, getRecentSessions);

//get user the session by id
router.get("/:id",protectRoute, getSessionById)
router.get("/:id/join",protectRoute, joinSession)
router.post("/:id/end",protectRoute, endSession)

export default router;