import Session from "../models/Session.js";
import { streamClient } from "../lib/stream.js";
import {chatClient} from "../lib/stream.js";


export async function createSession(req, res) {
    try {
        //take data from req body, problem
        const { problem, difficulty } = req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;
        if(!problem || !difficulty) {
            return res.status(400).json({message: "Problem and difficulty are required"});
        }

        //else - genrate a unique call id/stream call
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        // create session in DB
        const session = await Session.create({
            problem,
            difficulty,
            host: userId,
            callId
        });
        //create session in stream using stream.js export
        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_by_id: clerkId,
                custom:{problem, difficulty, sessionId: session._id.toString()}
            },
        })
        // create a chat 
        const channel = chatClient.channel("messaging", callId, {
            name: `Session on ${problem}`,
            created_by_id: clerkId,
            members: [clerkId]
        });
        await channel.create();
        return res.status(201).json({message: "Session created", session});

    } catch (error) {
        console.error("Error creating session:", error);
        return res.status(500).json({message: "Server error"});
    }
}
export async function getActiveSessions(req, res) {
    try {
        const activeSessions = await Session.find({status: 'active'})
        .populate('host', 'name clerkId')
        .populate('participant', 'name clerkId')
        .sort({createdAt: -1});
        return  res.status(200).json({activeSessions});
    }
    catch (error) {
        console.error("Error fetching active sessions:", error);
        return res.status(500).json({message: "Server error"});
    }
}
export async function getRecentSessions(req, res) {
    try {
        const userId= req.user._id;
        //get session where user is host or participant also whose status is completed
        const recentSessions = await Session.find({
            $or: [{host: userId}, {participant: userId}],
            status: 'completed'
        }).sort({updatedAt: -1}).limit(20)
        res.status(200).json({recentSessions});
    } catch (error) {
        console.error("Error fetching recent sessions:", error);
        return res.status(500).json({message: "Server error"});
    }
}

export async function getSessionById(req, res) {
    try {
        const sessionId = req.params.id;
        const session = await Session.findById(sessionId)
        .populate('host', 'name clerkId')
        .populate('participant', 'name clerkId');

        if(!session) {
            return res.status(404).json({message: "Session not found"});
        }
        return res.status(200).json({session});
    } catch (error) {
        console.error("Error fetching session by ID:", error);
        return res.status(500).json({message: "Server error"});
    }
}
export async function joinSession(req, res) {
    try {
        const sessionId = req.params.id;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;
        const session = await Session.findById(sessionId);
        if(!session) {
            return res.status(404).json({message: "Session not found"});
        }
        if(session.status !== 'pending') {
            return res.status(400).json({message: "Session is not available to join"});
        }
        if(session.host.toString() === userId.toString()) {
            return res.status(400).json({message: "Host cannot join their own session"});
        }
        if(session.participant && session.participant.toString() === userId.toString()) {
            return res.status(400).json({message: "You have already joined this session"});
        }
        if(session.participant) {
            return res.status(400).json({message: "Session already has a participant"});
        }

        session.participant = userId; //means 
        await session.save();
        // chat to chat
        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        return res.status(200).json({message: "Joined session", session});
    } catch (error) {
        console.error("Error joining session:", error);
        return res.status(500).json({message: "Server error"});
    }
}
export async function endSession(req, res) {
    try {
        const sessionId = req.params.id;
        const userId = req.user._id;

        const session = await Session.findById(sessionId);
        if(!session) {
            return res.status(404).json({message: "Session not found"});
        }
        //omly host can end the session
        if(session.host.toString() !== userId.toString()) {
            return res.status(403).json({message: "Only host can end the session"});
        }
        //if sessionis already completed
        if(session.status === 'completed') {
            return res.status(400).json({message: "Session is already completed"});
        }
        session.status = 'completed';
        await session.save();
        
        // delete video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete();

        //delete chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        return res.status(200).json({message: "Session ended", session});

    } catch (error) {
        console.error("Error ending session:", error);
        return res.status(500).json({message: "Server error"});
    }
}