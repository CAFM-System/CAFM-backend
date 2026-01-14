import express from 'express';
import { acceptTicket, assignPriorityToTicket, createTicket, diplayAllTickets } from '../../controllers/tickets.controller.js';
import authenticate from '../../middlewares/auth.js';
import checkRole from '../../middlewares/roleCheck.js';

const ticketRouter = express.Router();

ticketRouter.post('/',authenticate,checkRole("resident"), createTicket);
ticketRouter.get('/',authenticate,checkRole("resident","admin","technician"), diplayAllTickets);
ticketRouter.put('/assign-priority/:ticketId',authenticate,checkRole("admin"), assignPriorityToTicket);
ticketRouter.post('/accept/:id',authenticate,checkRole("technician"), acceptTicket);


export default ticketRouter;