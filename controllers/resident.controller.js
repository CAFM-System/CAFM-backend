import { notifyAdmins, notifyUserById } from "../models/notification.model.js";
import { addProgressHistoryEntry } from "../models/progressHistory.model.js";
import { getTicketById, updateTicket } from "../models/ticket.Model.js";
import { closedTicketEmail, reOpenTicketEmail } from "../utils/emailTemplates.js";

const closeTicket = async (req , res)=>{
    try {
        const { ticketId } = req.params;
        const message = req.body.message || "Ticket closed by resident";
        const ticket = await getTicketById(ticketId);
        if(!ticket){
            return res.status(404).json({ message: "Ticket not found" });
        }
        
        const newticket = await updateTicket(ticketId, { status: "closed" });
        

        await notifyAdmins(
            "Ticket Closed",
            closedTicketEmail(newticket)
        )

        await notifyUserById(
            ticket.technician_id,
            "Your Ticket is Closed",
            closedTicketEmail(newticket)
        );

        await addProgressHistoryEntry({
            ticket_id: ticketId,
            status: "closed",
            updated_by: `Resident (${req.user.name})`,
            message: message
        });

        res.status(200).json({
            message: "Ticket closed successfully",
        })

        
    } catch (error) {
        res.status(500).json({ message: "Failed to close ticket", error: error.message });
    }
}

const reOpenTicket = async (req , res)=>{
    try {
        const { ticketId } = req.params;
        const message = req.body.message || "Ticket reopened by resident";
        const ticket = await getTicketById(ticketId);
        if(!ticket){
            return res.status(404).json({ message: "Ticket not found" });
        }
        const newticket = await updateTicket(ticketId, { status: "open" });

        await notifyAdmins(
            "Ticket Reopened",
            reOpenTicketEmail(newticket)
        )

        await addProgressHistoryEntry(
            {
                ticket_id: ticketId,
                status: "open",
                updated_by: `Resident (${req.user.name})`,
                message: message
            }
        )

        res.status(200).json({
            message: "Ticket reopened successfully",
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to reopen ticket", error: error.message });
    }
}

export { closeTicket , reOpenTicket};



