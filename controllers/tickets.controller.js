import createUserSupabaseClient from "../config/userSupabaseClient.js";
import { addTicketData, getAllTickets } from "../models/ticket.Model.js";


const diplayAllTickets = async (req, res) => {
    try {
            const token = req.headers.authorization.split(" ")[1];
            const supabaseUser = createUserSupabaseClient(token);

          const tickets = await getAllTickets(supabaseUser);

          res.status(200).json(
            {
                message : "Tickets fetched successfully",
                tickets: tickets
            }
          )  
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tickets", error: error.message });
    }
}

const createTicket = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }
        const token = authHeader.split(" ")[1];
        const supabaseUser = createUserSupabaseClient(token);

        const ticketData = req.body;
        const newTicket = await addTicketData(ticketData, supabaseUser);
        res.status(201).json({
            message: "Ticket created successfully",
            ticket: newTicket
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create ticket", error: error.message });
    }
}

export { diplayAllTickets, createTicket };