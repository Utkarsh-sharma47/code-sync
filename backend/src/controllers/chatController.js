import { chatClient } from "../lib/stream.js"


export async function getStreamToken(req, res) {
    // Your implementation to get Stream token
    try {
        //use clerk user id from req.auth.userId (not monogo user id)
        const token = chatClient.createToken(req.auth.userId);
        return res.status(200).json({ token, userId: req.auth.userId, userImage: req.auth.userImage });
    } catch (error) {
        res.status(500).json({ message: "Error generating Stream token", error: error.message });
    }
}