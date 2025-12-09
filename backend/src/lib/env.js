// backend/src/lib/env.js
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,          // 5000 for local, PORT from Render in prod
  NODE_ENV: process.env.NODE_ENV || 'development'
};
