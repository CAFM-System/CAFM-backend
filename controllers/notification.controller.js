import { getNotificationsForUser, clearNotificationById } from "../models/notification.model.js";

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("Fetching notifications for userId:", userId);
        console.log("User role:", req.user.role);

        const notifications = await getNotificationsForUser(userId);

        console.log("Found notifications count:", notifications.length);

        res.status(200).json({
            message: "Notifications fetched successfully",
            notifications: notifications
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
    }
}

const clearNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const result = await clearNotificationById(notificationId);

        res.status(200).json({
            message: "Notification cleared successfully",
            result: result
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear notification", error: error.message });
    }
}

export { getUserNotifications, clearNotification };