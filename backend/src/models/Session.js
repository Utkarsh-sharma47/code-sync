import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: { type: String, required: true },
    difficulty: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // NOT required initially
    callId: { type: String, required: true, unique: true },
    status: { type: String, default: "active" }, // 'active', 'completed'
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;