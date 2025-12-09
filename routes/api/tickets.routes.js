import express from 'express';
import { createTicket, diplayAllTickets } from '../../controllers/tickets.controller.js';

const ticketRouter = express.Router();

ticketRouter.post('/', createTicket);
ticketRouter.get('/',diplayAllTickets);


export default ticketRouter;