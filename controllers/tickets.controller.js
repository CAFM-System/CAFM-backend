import { notifyAdmin, notifyUserById } from "../models/notification.model.js";
import { addProgressHistoryEntry } from "../models/progressHistory.model.js";
import { addTicketData, getAllTickets, updateTicket } from "../models/ticket.Model.js";
import { newTicketAdminEmail, residentAssignedEmail, technicianAssignmentEmail } from "../utils/emailTemplates.js";
import { newTicketAdminSMS, technicianAssignmentSMS, residentAssignedSMS } from "../utils/smsTemplates.js";


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

const assignTechnicianToTicket = async (req, res) => {
    try {
        const { ticketId} = req.params;
        const { technician_id,priority } = req.body;

        const ticket = await updateTicket(
            ticketId,
            { technician_id: technician_id ,priority:priority,status: 'assigned'}
        )

        await notifyUserById(
            technician_id,
            "New Ticket Assigned",
            technicianAssignmentEmail(ticket),
            technicianAssignmentSMS(ticket)
        )

        await notifyUserById(
            ticket.resident_id,
            "Technician Assigned to Your Ticket",
            residentAssignedEmail(ticket),
            residentAssignedSMS(ticket)
        )
        

        await addProgressHistoryEntry(
            {
                ticket_id: ticketId,
                status: 'assigned',
                updated_by:`${req.user.name} (${req.user.role})`,
                message: "Technician assigned to the ticket",
                notify_status: false
                
            }
        );
        res.status(200).json({ message: "Technician assigned successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to assign technician", error: error.message });
    }
}

export { diplayAllTickets, createTicket,assignTechnicianToTicket };