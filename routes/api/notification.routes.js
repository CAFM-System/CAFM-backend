import { getUserNotifications, clearNotification } from "../../controllers/notification.controller.js";
import express from "express";
import authenticate from "../../middlewares/auth.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authenticate, getUserNotifications);
notificationRouter.post("/:id", authenticate, clearNotification);

export default notificationRouter;