import { requireAuth } from '@clerk/express';
import { User } from '../models/User.js'; // Ensure this matches your export (default vs named)

export const protectRoute = [
  // 1. Clerk's middleware checks if the user is logged in
  requireAuth(), 

  // 2. Your custom middleware finds the user in the DB
  async (req, res, next) => {
    try {
      // FIX: req.auth is an object, not a function
      const clerkId = req.auth.userId; 

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized: No clerk ID found" });
      }

      // Find user in DB
      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      // Attach user to req object
      req.user = user;
      next();

    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      res.status(500).json({ message: "Server error in authentication" });
    }
  }
];