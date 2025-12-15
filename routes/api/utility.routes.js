import express from "express";
import { generateTicketsPDF, generateTicketsExcel } from "../../controllers/utility.controller.js";

const router = express.Router();

router.get("/pdf", generateTicketsPDF);
router.get("/excel", generateTicketsExcel);

export default router;