import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import cors from "cors";
import { protectRoute } from "./middleware/protectRoute.js";
import { clerkMiddleware } from "@clerk/express";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = ENV.NODE_ENV || process.env.NODE_ENV || "production";
const PORT = process.env.PORT || ENV.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors({ 
  origin: [
    ENV.CLIENT_URL,                    // Your local or env-defined URL
    "https://code-sync-0xoi.onrender.com" // Your deployed frontend
  ], 
  credentials: true 
}));
// this add auth field to req object: req.auth()
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat" ,chatRoutes);
app.use("/api/sessions" ,sessionRoutes);

// API test
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});
// endpoint only visible to authenticated users: protectedRoute
// when you pass array of middlewares, they are executed in order
// first requireAuth from Clerk, then your custom middleware
app.get("/video-calls", protectRoute, (req, res) => {
  res.json({ message: "video call endpoint" });
});

app.get("/health", (req, res) => {
  req.auth();
  res.json({ message: "Health check for video calls" });
});

// Serve frontend build (default to production behaviour)
const frontendPath = path.resolve(__dirname, "../../frontend/app/dist");
app.use(express.static(frontendPath));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// funciton to start the server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};
//call the function to start the server
startServer();
