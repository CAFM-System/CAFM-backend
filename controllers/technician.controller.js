import { addAtachments } from "../models/attachments.model.js";
import { notifyUserById } from "../models/notification.model.js";
import { addProgressHistoryEntry } from "../models/progressHistory.model.js";
import { getTicketById, updateTicket } from "../models/ticket.Model.js";
import { resolvedTicketEmail, technicianworkStartedEmail } from "../utils/emailTemplates.js";


const addWorkStartTime = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const technicianId = req.user.id;

    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!ticket.technician_id) {
      return res.status(400).json({ message: "Ticket not assigned to any technician" });
    }

    if (ticket.technician_id !== technicianId) {
      return res.status(403).json({
        message: "You are not assigned to this ticket"
      });
    }

    const startTime = new Date().toISOString();
    const updateData = { started_date: startTime, status: "in_progress" };

    const newticket = await updateTicket(ticketId, updateData);

    await notifyUserById(
            ticket.resident_id,
            "Work Started on Your Ticket",
            technicianworkStartedEmail(newticket, startTime)
        )

    await addProgressHistoryEntry({
      ticket_id: ticketId,
      status: "in_progress",
      updated_by: `Technician (${req.user.name})`,
      message: `Work started at ${new Date(startTime).toLocaleString("en-GB")}`
    });

    return res.status(200).json({
      message: "Work started successfully",
      started_date: startTime
    });

  } catch (error) {
    console.error("Start work error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resolveTicket = async (req, res) => {
  try{
    const { ticketId } = req.params;
    const technicianId = req.user.id;
    const attachments = req.body.attachments || [];

    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!ticket.technician_id) {
      return res.status(400).json({ message: "Ticket not assigned to any technician" });
    }

    if (ticket.technician_id !== technicianId) {
      return res.status(403).json({
        message: "You are not assigned to this ticket"
      });
    }

    const resolveTime = new Date().toISOString();
    const message = req.body.message || "Ticket resolved by technician";
    const sparePartsUsed = req.body.sparePartsUsed || [];
    const updateData = { completed_date: resolveTime, status: "resolved", spare_parts: sparePartsUsed };
    const attachment = {
      ticket_id: ticketId,
      uploaded_by: req.user.id,
      file_urls: attachments
    }

    const newticket = await updateTicket(ticketId, updateData);

    await addAtachments(attachment);

    await notifyUserById(
            ticket.resident_id,
            "Your Ticket Has Been Resolved",
            resolvedTicketEmail(newticket, resolveTime)
        )

    await addProgressHistoryEntry({
      ticket_id: ticketId,
      status: "resolved",
      updated_by: `Technician (${req.user.name})`,
      message: `${message}`
    });

    return res.status(200).json({
      message: "Ticket resolved successfully",
      resolved_date: resolveTime
    });
    
    
  }catch(error){
    console.error("Resolve ticket error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { addWorkStartTime, resolveTicket };
