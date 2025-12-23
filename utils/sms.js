import axios from 'axios';
import dotenv from 'dotenv';



dotenv.config();

const apiToken = process.env.TEXTLK_API_TOKEN;
const senderId = process.env.TEXTLK_SENDER_ID;
const apiUrl = 'https://app.text.lk/api/v3/sms/send';

export const sendTextLKSMS = async (to, message) => {
    try {
        // Format phone number (ensure it starts with 94)
        const phoneNumber = to.startsWith('94') ? to : `94${to.replace(/^0+/, '')}`;
        
        const response = await axios.post(apiUrl, {
            recipient: phoneNumber,
            sender_id: senderId,
            message: message,
        }, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            }
        });

        console.log("SMS sent to:", phoneNumber);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("SMS error:", error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

export default sendTextLKSMS;