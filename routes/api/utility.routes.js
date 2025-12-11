import express from "express";
import { generateTicketsPDF } from "../../controllers/utility.controller.js";

const router = express.Router();

router.get("/pdf", generateTicketsPDF);

export default router;