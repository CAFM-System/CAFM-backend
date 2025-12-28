import express from 'express';
import authenticate from '../../middlewares/auth.js';
import checkRole from '../../middlewares/roleCheck.js';
import { addWorkStartTime, resolveTicket } from '../../controllers/technician.controller.js';

const technicianRouter = express.Router();


technicianRouter.put("/update-time/:ticketId",authenticate,checkRole("technician"), addWorkStartTime);
technicianRouter.put("/resolve-ticket/:ticketId",authenticate,checkRole("technician"), resolveTicket);

export default technicianRouter;