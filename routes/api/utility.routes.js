import express from "express";
import { generateTicketsPDF, generateTicketsExcel } from "../../controllers/utility.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const utilityRouter = express.Router();
utilityRouter.post("/pdf", authenticate,checkRole("admin"), generateTicketsPDF);
utilityRouter.post("/excel", authenticate,checkRole("admin"), generateTicketsExcel);

export default utilityRouter;