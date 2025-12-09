import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./lib/env.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = ENV.NODE_ENV || process.env.NODE_ENV || "production";
const PORT = ENV.PORT || 3000;

// API test
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Serve frontend build (default to production behaviour)
const frontendPath = path.resolve(__dirname, "../../frontend/app/dist");
app.use(express.static(frontendPath));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (NODE_ENV=${NODE_ENV})`);
});
