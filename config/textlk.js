import { sendSMS } from "textlk-node";
import dotenv from "dotenv";

dotenv.config();

const apiToken = process.env.TEXTLK_API_TOKEN;
const senderId = process.env.TEXTLK_SENDER_ID;

export const sendTextLKSMS = async (to, message) => {
    try {
        await sendSMS({
            phoneNumber: to,
            message,
            senderId,
            apiToken
        });
        console.log("SMS sent to:", to);
    } catch (error) {
        console.error("SMS error:", error);
    }
};
