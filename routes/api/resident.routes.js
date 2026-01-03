import express from "express";
import { closeTicket } from "../../controllers/resident.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const residentRouter = express.Router();

residentRouter.put("/close-ticket/:ticketId",authenticate,checkRole("resident"),closeTicket);

export default residentRouter;
