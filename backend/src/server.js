import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import cors from "cors";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = ENV.NODE_ENV || process.env.NODE_ENV || "production";
const PORT = process.env.PORT || ENV.PORT || 5000;

// API test
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

//middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions }));

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
