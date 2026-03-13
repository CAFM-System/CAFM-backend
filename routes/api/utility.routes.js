import express from "express";
import { generateTicketsPDF, generateTicketsExcel, generateVisitorsPDF, generateVisitorsExcel } from "../../controllers/utility.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const utilityRouter = express.Router();
utilityRouter.post("/pdf", authenticate, checkRole("admin"), generateTicketsPDF);
utilityRouter.post("/excel", authenticate, checkRole("admin"), generateTicketsExcel);
utilityRouter.post("/visitors/pdf", authenticate, checkRole("admin"), generateVisitorsPDF);
utilityRouter.post("/visitors/excel", authenticate, checkRole("admin"), generateVisitorsExcel);

export default utilityRouter;