import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();
import { ENV } from './lib/env.js';

const app = express();
console.log('Iside .env PORT =', ENV.PORT);
const PORT = ENV.PORT;

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});