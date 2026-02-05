import { notifyAdmin, notifyTechnicians, notifyUserById } from "../models/notification.model.js";
import { addProgressHistoryEntry } from "../models/progressHistory.model.js";
import { acceptTicketByTechnician, addTicketData, getAllTickets, getTicketById, updateTicket } from "../models/ticket.Model.js";
import { newTicketAdminEmail,technicianAcceptedAdminEmail, technicianAcceptedResidentEmail} from "../utils/emailTemplates.js";
import { newTicketAdminSMS, technicianAcceptedAdminSMS, technicianAcceptedResidentSMS } from "../utils/smsTemplates.js";


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

const displayTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await getTicketById(ticketId);
        res.status(200).json({
            message: "Ticket fetched successfully",
            ticket: ticket
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch ticket", error: error.message });
    }
}

const createTicket = async (req, res) => {
    try {
        const ticketData = {
            ...req.body,
            resident_id: req.user.id,
            status: 'open',
            resident_name: req.user.name
        };
        
        const newTicket = await addTicketData(ticketData);

        console.log("New Ticket :", newTicket);
        await notifyAdmin(
            newTicket.job_type,
            "New Ticket Created",
            newTicketAdminEmail(newTicket),
            newTicketAdminSMS(newTicket)
        )

        // await notifyTechnicians(
        //     newTicket.id,
        //     newTicket.job_type
        // ).catch(console.error);
        

       

        await addProgressHistoryEntry(
            {
                ticket_id: newTicket.id,
                status: 'open',
                updated_by:`${req.user.name} (${req.user.role})`,
                message: "Ticket created",
                notify_status: false
                
                
            }
        );

        res.status(201).json({
            message: "Ticket created successfully",
            ticket: newTicket
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create ticket", error: error.message });
    }
}

const assignPriorityToTicket = async (req, res) => {
    try {
        const { ticketId} = req.params;
        const { priority } = req.body;

        const ticket = await updateTicket(
            ticketId,
            { priority:priority}
        )

        await notifyTechnicians(
            ticket.id,
            ticket.job_type
        ).catch(console.error);

        
        

        
        res.status(200).json({ message: "Add priority successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to add priority", error: error.message });
    }
}

const acceptTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const technicianId = req.user.id; // from auth middleware

        const ticket = await acceptTicketByTechnician(
            ticketId,
            technicianId
        );

        if (!ticket) {
            return res.status(409).json({
                message: "Ticket already assigned"
            });
        }

        // 🔔 Notify admin
        notifyAdmin(
            ticket.job_type,
            "Ticket Accepted",
            technicianAcceptedAdminEmail(ticket),
            technicianAcceptedAdminSMS(ticket)
            
        ).catch(console.error);

        // 🔔 Notify resident
        notifyUserById(
            ticket.resident_id,
            "Technician Assigned",
            technicianAcceptedResidentEmail(ticket),
            technicianAcceptedResidentSMS(ticket)
        ).catch(console.error);

        await addProgressHistoryEntry(
            {
                ticket_id: ticketId,
                status: 'assigned',
                updated_by:`${req.user.name} (${req.user.role})`,
                message: "Technician assigned to the ticket",
                notify_status: false
                
            }
        );

        res.status(200).json({
            message: "Ticket accepted successfully",
            ticket
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to accept ticket",
            error: error.message
        });
    }
};

export { diplayAllTickets, createTicket,assignPriorityToTicket,acceptTicket, displayTicketById };