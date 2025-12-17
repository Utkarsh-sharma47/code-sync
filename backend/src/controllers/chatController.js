import { chatClient } from "../lib/stream.js";
import {User} from "../models/User.js"; // Import User model

export async function getStreamToken(req, res) {
    try {
        const userId = req.auth?.userId; // Clerk ID from protectRoute

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1. Generate Token
        const token = chatClient.createToken(userId);

        // 2. Fetch User Details from DB to get Name & Image
        // (req.auth usually only has the ID, not the name/image)
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Compute display name and image with safe fallbacks
        const userName =
            [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
            user.name ||
            user.username ||
            user.email ||
            "Unknown";
        const userImage = user.profileImage || user.image || user.imageUrl || "";

        // 4. Return everything the Frontend needs
        return res.status(200).json({ 
            token, 
            userId: userId, 
            userName,
            userImage
        });

    } catch (error) {
        console.error("Error generating Stream token:", error);
        res.status(500).json({ message: "Error generating Stream token" });
    }
}
