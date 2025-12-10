import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB() {
    try {
        const connect = await mongoose.connect(ENV.DB_URL);
        console.log(`✅ MongoDB Connected: ${connect.connection.host}`);
    } catch (error) {
        console.error(`❌Error in connecting to MongoDB: ${error.message}`);
        process.exit(1); 
    }
}