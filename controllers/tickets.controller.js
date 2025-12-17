import { addTicketData, getAllTickets } from "../models/ticket.Model.js";


const diplayAllTickets = async (req, res) => {
    try {
            

          const tickets = await getAllTickets(req.user);

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
        const ticketData = {
            ...req.body,
            resident_id: req.user.id
        };
        
        const newTicket = await addTicketData(ticketData);
        res.status(201).json({
            message: "Ticket created successfully",
            ticket: newTicket
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create ticket", error: error.message });
    }
}

export { diplayAllTickets, createTicket };