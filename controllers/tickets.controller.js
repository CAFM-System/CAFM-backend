import { notifyAdmins } from "../models/notification.model.js";
import { addProgressHistoryEntry } from "../models/progressHistory.model.js";
import { addTicketData, getAllTickets, updateTicket } from "../models/ticket.Model.js";
import { newTicketAdminEmail } from "../utils/emailTemplates.js";


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

        await notifyAdmins(
            "New Ticket Created",
            newTicketAdminEmail(newTicket),
            
        )

        res.status(201).json({
            message: "Ticket created successfully",
            ticket: newTicket
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create ticket", error: error.message });
    }
}

const assignTechnicianToTicket = async (req, res) => {
    try {
        const { ticketId} = req.params;
        const { technician_id } = req.body;

        await updateTicket(
            ticketId,
            { technician_id: technician_id ,status: 'assigned'}
        )

        await addProgressHistoryEntry(
            {
                ticket_id: ticketId,
                status: 'assigned',
                updated_by:`${req.user.name} (${req.user.role})`,
                message: "Technician assigned to the ticket",
                
            }
        );
        res.status(200).json({ message: "Technician assigned successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to assign technician", error: error.message });
    }
}

export { diplayAllTickets, createTicket,assignTechnicianToTicket };