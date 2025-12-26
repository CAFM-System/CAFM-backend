import { supabase, supabaseAdmin } from "../config/supabaseClient.js";
import { sendEmail } from "../utils/mailer.js";
import { sendTextLKSMS } from "../utils/sms.js";

const notifyUserById = async (userId, subject, html)=>{

    if (!userId) {
        console.error(" notifyUserById called with empty userId");
        return;
    }


    const {data,error} = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error) {
        console.error("Error fetching user for notification:", error.message);
        return;
    }    
    if(!data?.user?.email) {
        console.error("No email found for user ID:", userId);
        return;
    }

    try {
        await sendEmail(
            {
                to: data.user.email,
                subject,
                html
            }
        )
        console.log(`✓ Notification email sent to ${data.user.email}`);
    } catch (error) {
        console.error("Error sending notification email:", error);
    }
}


const notifyAdmins = async (subject,html)=>{
    const {data:admins,error} = await supabaseAdmin
        .from("admins")
        .select("user_id");

    if (error) {
        console.error("Error fetching admins for notification:", error.message);
        return;
    }   
    for(const admin of admins){
        await notifyUserById(admin.user_id,subject,html);
    }
}

const notifyUserByIdSMS = async (userId, message) => {
    if (!userId) {
        console.error("notifyUserByIdSMS called with empty userId");
        return;
    }

    if (!message) {
        console.error("notifyUserByIdSMS called with empty message");
        return;
    }

    // Get user profile for phone number
    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching user profile for SMS:", error.message);
        return;
    }

    if (!profile?.phone) {
        console.log(`No phone number found for user ${userId}`);
        return;
    }

    try {
        await sendTextLKSMS(profile.phone, message);
        console.log(`✓ SMS sent to ${profile.phone}`);
    } catch (error) {
        console.error("Error sending SMS:", error);
    }
};

const notifyAdminsSMS = async (message) => {
    const { data: admins, error } = await supabaseAdmin
        .from("admins")
        .select("user_id");

    if (error) {
        console.error("Error fetching admins for SMS notification:", error.message);
        return;
    }

    for (const admin of admins) {
        await notifyUserByIdSMS(admin.user_id, message);
    }
};

export {notifyUserById,notifyAdmins,notifyUserByIdSMS,notifyAdminsSMS};