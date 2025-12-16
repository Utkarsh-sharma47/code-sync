import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    // Human-friendly session name for display
    name: { type: String, required: true },
    problem: { type: String, required: true },
    difficulty: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // NOT required initially
    callId: { type: String, required: true, unique: true },
    status: { type: String, default: "active" }, // 'active', 'completed'
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility: some frontend code still refers to "sessionName"
sessionSchema.virtual("sessionName").get(function () {
  return this.name;
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;