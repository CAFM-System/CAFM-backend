import express from "express";
import { generateTicketsPDF, generateTicketsExcel } from "../../controllers/utility.controller.js";
import authenticate from "../../middlewares/auth.js";

const router = express.Router();

router.post("/pdf", authenticate, generateTicketsPDF);
router.post("/excel", authenticate, generateTicketsExcel);

export default router;