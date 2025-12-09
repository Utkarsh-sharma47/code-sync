import dotenv from 'dotenv';
dotenv.config();

// you dont need to import dotenv in other files now
// just import ENV from this file and get access to your env variables

export const ENV = {
    PORT : process.env.PORT,
    NODE_ENV : process.env.NODE_ENV
}