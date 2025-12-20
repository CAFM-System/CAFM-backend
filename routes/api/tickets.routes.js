import express from 'express';
import { assignTechnicianToTicket, createTicket, diplayAllTickets } from '../../controllers/tickets.controller.js';
import authenticate from '../../middlewares/auth.js';
import checkRole from '../../middlewares/roleCheck.js';

const ticketRouter = express.Router();

ticketRouter.post('/',authenticate,checkRole("resident"), createTicket);
ticketRouter.get('/',authenticate,checkRole("resident","admin","technician"), diplayAllTickets);
ticketRouter.put('/assign-technician/:ticketId',authenticate,checkRole("admin"), assignTechnicianToTicket);


export default ticketRouter;