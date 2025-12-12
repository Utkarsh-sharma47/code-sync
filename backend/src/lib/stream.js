import {StreamChat} from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "./env.js";

//get the stream api key and secret from env variables
const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("Stream API key and secret missing");
}
// this is for server side only : chat features
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);
// this is for video call features
export const streamClient = new StreamClient(apiKey, apiSecret);

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
