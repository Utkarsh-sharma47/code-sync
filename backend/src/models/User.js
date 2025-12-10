import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    clerkId: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);


export const User = mongoose.model("User", userSchema);
