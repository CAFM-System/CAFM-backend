import { getUserNotifications, clearNotification } from "../../controllers/notification.controller.js";
import express from "express";
import authenticate from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, getUserNotifications);
router.post("/:id", authenticate, clearNotification);

export default router;