import mongoose from "mongoose"; // <--- THIS WAS MISSING
import Session from "../models/Session.js";
import {User} from "../models/User.js"; 
import { streamClient } from "../lib/stream.js";
import { chatClient } from "../lib/stream.js";

export async function createSession(req, res) {
    try {
        const { problem, difficulty, problemId, sessionName } = req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        if (!problem || !difficulty) {
            return res.status(400).json({ message: "Problem details are missing" });
        }

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // 1. Create in MongoDB
        let session;
        try {
            session = await Session.create({
                problem,      // Saves "Two Sum"
                problemId,    // Saves "two-sum"
                difficulty,
                host: userId,
                callId,
                sessionName: sessionName || `Session: ${problem}` // Default name
            });
        } catch (dbError) {
            console.error("Session create DB error:", dbError);
            return res.status(500).json({ message: "Failed to create session" });
        }

        // 2. Create in Stream
        try {
            await streamClient.video.call("default", callId).getOrCreate({
                data: {
                    created_by_id: clerkId,
                    custom: { 
                        problem, 
                        difficulty, 
                        sessionId: session._id.toString(),
                        title: session.sessionName 
                    }
                },
            });
            
            const channel = chatClient.channel("messaging", callId, {
                name: session.sessionName,
                created_by_id: clerkId,
                members: [clerkId]
            });
            await channel.create();
        } catch (streamError) {
            console.error("Stream Warning:", streamError.message);
        }

        return res.status(201).json({ message: "Session created", session });

    } catch (error) {
        console.error("Creation Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getActiveSessions(req, res) {
    try {
        const activeSessions = await Session.find({ status: { $in: ['active', 'pending'] } })
            .populate('host', 'firstName lastName clerkId')
            .populate('participant', 'firstName lastName clerkId')
            .sort({ createdAt: -1 });
        return res.status(200).json(activeSessions);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getRecentSessions(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(400).json({ message: "User missing on request" });
        }

        // Ensure ID is an ObjectId so the query finds your history
        const userObjectId = new mongoose.Types.ObjectId(userId.toString());

        const recentSessions = await Session.find({
            $or: [{ host: userObjectId }, { participant: userObjectId }],
            status: 'completed' // Only completed sessions show in history
        })
        .populate('host', 'firstName lastName clerkId')
        .populate('participant', 'firstName lastName clerkId')
        .sort({ updatedAt: -1 })
        .limit(20);

        return res.status(200).json(recentSessions);
    } catch (error) {
        console.error("Error fetching history:", error); // Check this log if still empty
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getSessionById(req, res) {
    try {
        const session = await Session.findById(req.params.id)
            .populate('host', 'firstName lastName clerkId')
            .populate('participant', 'firstName lastName clerkId');
        if (!session) return res.status(404).json({ message: "Session not found" });
        return res.status(200).json(session);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const clerkId = req.user.clerkId;
        const fullName = `${req.user.firstName} ${req.user.lastName}`;
        
        if (!userId) {
            return res.status(400).json({ message: "User missing on request" });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId.toString());
        const session = await Session.findById(id);

        if (!session) return res.status(404).json({ message: "Session not found" });
        if (session.status !== 'pending' && session.status !== 'active') return res.status(400).json({ message: "Not available" });
        if (session.host.toString() === userId.toString()) return res.status(400).json({ message: "Cannot join own session" });
        if (session.participant) return res.status(400).json({ message: "Session is full (2/2 participants)" });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Atomic claim of the participant slot to avoid race conditions
        const updatedSession = await Session.findOneAndUpdate(
            { _id: id, participant: { $in: [null, undefined] } },
            { participant: userObjectId, participantClerkId: clerkId, status: "active" },
            { new: true }
        )
        .populate('host', 'firstName lastName clerkId')
        .populate('participant', 'firstName lastName clerkId');

        if (!updatedSession) {
            return res.status(400).json({ message: "Session is full (2/2 participants)" });
        }

        // Ensure the participant exists in Stream Chat and is a channel member
        try {
            // Ensure channel exists (idempotent create)
            const channel = chatClient.channel("messaging", updatedSession.callId, {
                name: updatedSession.sessionName,
                created_by_id: updatedSession.host?.clerkId || clerkId,
            });
            try {
                await channel.create();
            } catch (createErr) {
                // Ignore "already exists" errors
                if (!(createErr?.code === 17 || createErr?.message?.includes("already"))) {
                    throw createErr;
                }
            }

            await chatClient.upsertUser({
                id: clerkId,
                name: fullName || user.username || "Unknown",
                image: req.user.image || user.image || user.imageUrl || "",
                role: "user",
            });

            // Add both host and participant to be safe (host might have been created without membership)
            const memberIds = [clerkId];
            if (updatedSession.host?.clerkId) memberIds.push(updatedSession.host.clerkId);
            await channel.addMembers(memberIds);
        } catch (chatError) {
            console.error("Chat membership error:", chatError);
            return res.status(500).json({ message: "Failed to join chat channel" });
        }

        return res.status(200).json({ message: "Joined", session: updatedSession });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function endSession(req, res) {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: "Session not found" });
        if (session.host.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

        try {
            await streamClient.video.call("default", session.callId).delete();
            await chatClient.channel("messaging", session.callId).delete();
        } catch (err) { console.log("Stream cleanup warning"); }
        
        session.status = 'completed';
        await session.save();
        return res.status(200).json({ message: "Ended" });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
    
}