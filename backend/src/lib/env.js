// backend/src/lib/env.js
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,          // 5000 for local, PORT from Render in prod
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY || '',
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY || '',
  STREAM_API_KEY: process.env.STREAM_API_KEY || '',
  STREAM_API_SECRET: process.env.STREAM_API_SECRET || ''
};
