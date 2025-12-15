import express from "express";
import {
    createTicket,
    assignTechnician,
    updateTicketStatus
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", createTicket);

router.post('/:ticket_id/assign', assignTechnician);
router.put("/:ticket_id/status", updateTicketStatus);

export default router;
