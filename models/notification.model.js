import { supabase, supabaseAdmin } from "../config/supabaseClient.js";
import { sendEmail } from "../utils/mailer.js";
import { sendTextLKSMS } from "../utils/sms.js";

const notifyUserById = async (userId, subject, html, message) => {

    if (!userId) {
        console.error(" notifyUserById called with empty userId");
        return;
    }

    const { data, error_email } = await supabaseAdmin.auth.admin.getUserById(userId);

    const { data: profile, error_sms } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("user_id", userId)
        .maybeSingle();

    if (error_email || error_sms) {
        console.error("Error fetching user for notification:", error.message);
        return;
    }

    if (!data?.user?.email) {
        console.error("No email found for user ID:", userId);
        return;
    }

    if (!profile?.phone) {
        console.log(`No phone number found for user ${userId}`);
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

        await sendTextLKSMS(profile.phone, message);

        console.log(`✓ Notification email sent to ${data.user.email}`);
        console.log(`✓ SMS sent to ${profile.phone}`);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

const notifyAdmin = async (jobType, subject, html, message) => {
    const { data: admins, error } = await supabaseAdmin
        .from("admins", { schema: "auth" })
        .select("user_id")
        .eq("job_type", jobType);

    if (error) {
        console.error("Error fetching admins for notification:", error.message);
        return;
    }

    for (const admin of admins) {
        await notifyUserById(admin.user_id, subject, html, message);
    }
}

const getNotificationsForUser = async (userId) => {
    if (!userId) {
        console.error("getNotificationsForUser called with empty userId");
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("progress_histories")
            .select(`
                *,
                tickets!inner()
            `)
            .eq("tickets.resident_id", userId)
            .eq("notify_status", false)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching notifications:", error.message);
            throw new Error(error.message);
        }

        return data || [];
    } catch (error) {
        console.error("Error in getNotificationsForUser:", error);
        throw error;
    }
}

const clearNotificationById = async (notificationId) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("progress_histories")
            .update({ notify_status: true })
            .eq("id", notificationId);

        if (error) {
            console.error("Error clearing notification:", error.message);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error("Error in clearNotificationById:", error);
        throw error;
    }
}

export { notifyAdmin, notifyUserById, getNotificationsForUser, clearNotificationById };