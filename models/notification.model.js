import { supabase, supabaseAdmin } from "../config/supabaseClient.js";
import { sendEmail } from "../utils/mailer.js";

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

export {notifyUserById,notifyAdmins};