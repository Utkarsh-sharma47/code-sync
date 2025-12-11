import {StreamChat} from "stream-chat";
import { ENV } from "./env.js";

//get the stream api key and secret from env variables
const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("Stream API key and secret missing");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData)=>{
    try {
        await chatClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.error("Error upserting stream user:", error);
    }
}

export const deleteStreamUser = async(userId)=>{
    try {
        await chatClient.deleteUser(userId);
        console.log(`Stream user "${userId}" deleted`);
    } catch (error) {
        console.error("Error deleting stream user:", error);
    }
}

// TODO : generate another method - generate Token 