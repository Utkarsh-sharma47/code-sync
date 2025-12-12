import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    problem: {type: String, required: true},
    difficulty: {type: String, required: true},
    host:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    callId: { type: String, required: true }
}
, { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);
export default Session;