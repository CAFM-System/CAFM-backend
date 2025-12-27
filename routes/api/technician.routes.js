import express from 'express';
import authenticate from '../../middlewares/auth.js';
import checkRole from '../../middlewares/roleCheck.js';
import { addWorkStartTime } from '../../controllers/technician.controller.js';

const technicianRouter = express.Router();


technicianRouter.put("/update-time/:ticketId",authenticate,checkRole("technician"), addWorkStartTime);

export default technicianRouter;