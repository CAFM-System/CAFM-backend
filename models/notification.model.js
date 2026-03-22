import { supabaseAdmin } from "../config/supabaseClient.js";
import { technicianBroadcastEmail } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/mailer.js";
import { sendTextLKSMS } from "../utils/sms.js";
import dotenv from "dotenv";

dotenv.config();


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
        console.error("Error fetching user for notification:", error_email?.message || error_sms?.message);
        return;
    }

    if (!data?.user?.email) {
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

        if (profile?.phone) {
            await sendTextLKSMS(profile.phone, message);
            console.log(`✓ SMS sent to ${profile.phone}`);
        } else {
            console.log(`No phone number found for user ${userId}. Email sent only.`);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

const notifyAdmin = async (jobType, subject, html, message) => {
    const normalizedJobType = jobType.trim();

    const { data: admins, error } = await supabaseAdmin
        .from("admins")
        .select("user_id")
        .eq("job_type", normalizedJobType);

    if (error) {
        console.error("Admin fetch error:", error.message);
        return;
    }

    console.log("🟢 Admin count:", admins.length);

    for (const admin of admins) {
        notifyUserById(
            admin.user_id,
            subject,
            html,
            message
        ).catch(console.error);
    }
};

const notifyVisitor = async (email, phone, subject, html, qrBuffer) => {

    const message = `Your QR code has been generated. Please check your email for the QR code.`;
    if (!email && !phone) {
        console.error("No email or phone number provided for QR code notification.");
        return;
    }
    try {
        if (email) {
            await sendEmail(
                {
                    to: email,
                    subject,
                    html,
                    attachments: qrBuffer
                        ? [
                            {
                                filename: "visitor-qr.png",
                                content: qrBuffer,
                                cid: "visitorqr"
                            }
                        ]
                        : []
                }
            )
            console.log(`✓ QR code email sent to ${email}`);
        }
        if (phone) {
            await sendTextLKSMS(phone, message);
            console.log(`✓ QR code SMS sent to ${phone}`);
        }
    } catch (error) {
        console.error("Error sending QR code notification:", error);
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
                tickets!inner(*)
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

const notifyTechnicians = async (ticketId, jobType, ticketData = {}) => {
    const normalizedJobType = jobType?.trim();

    const { data: techs, error: techError } = await supabaseAdmin
        .from("technicians")
        .select("user_id")
        .eq("job", normalizedJobType);

    if (techError) {
        throw new Error(`Technician fetch error: ${techError.message}`);
    }

    if (!techs || techs.length === 0) {
        console.log(`No technicians found for job type: ${normalizedJobType}`);
        return;
    }

    for (const tech of techs) {
        const { error: offerError } = await supabaseAdmin
            .from("ticket_offers")
            .insert({
                ticket_id: ticketId,
                technician_id: tech.user_id
            });

        if (offerError) {
            console.error(`Ticket offer insert failed for technician ${tech.user_id}: ${offerError.message}`);
        }

        const acceptUrl = `${process.env.FRONTEND_URL}/technician/accept-ticket?ticket=${ticketId}`;

        await notifyUserById(
            tech.user_id,
            "New Ticket Available",
            technicianBroadcastEmail(ticketId, acceptUrl, ticketData),
            "New ticket available. Check your email to accept."
        );
    }
};


export { notifyAdmin, notifyUserById, getNotificationsForUser, clearNotificationById, notifyTechnicians, notifyVisitor };