import express from 'express';
import { diplayAllTickets } from '../../controllers/tickets.controller.js';

const ticketRouter = express.Router();

ticketRouter.get('/',diplayAllTickets);

export default ticketRouter;