import { sendTextLKSMS } from "../config/textlk.js";
import {
    getTicketWithContacts,
    getAllAdmins,
    getTechnicianProfile,
    createTicketRecord,
    assignTechnicianToTicket,
    updateTicketStatusRecord,
    getTicketByTicketId
} from "../models/message.Model.js";

//  SMS NOTIFICATION HELPERS

const notifyAdmins = async (message) => {
    const admins = await getAllAdmins();

    // Send to all admins
    for (const admin of admins) {
        await sendTextLKSMS(admin.admin_phone, message);
    }
};

const notifyUser = async (phone, message) => {
    await sendTextLKSMS(phone, message);
};

//  CONTROLLER: RESIDENT CREATES TICKET

export const createTicket = async (req, res) => {
    const {
        ticket_id,
        complaint,
        resident_name,
        location,
        job_type,
        special_note,
        complaint_category,
        time_reported,
        reported_to,
        complaint_received_by,
        priority,
        resident_id
    } = req.body;

    // Validate required fields (NOT NULL columns in database)
    if (!ticket_id || !complaint || !resident_name || !location || !job_type) {
        return res.status(400).json({
            error: "ticket_id, complaint, resident_name, location, and job_type are required"
        });
    }

    // Build insert object with required fields
    const insertData = {
        ticket_id,
        complaint,
        resident_name,
        location,
        job_type,
        status: "CREATED"
    };

    // Add optional fields only if they are provided
    if (special_note) insertData.special_note = special_note;
    if (complaint_category) insertData.complaint_category = complaint_category;
    if (time_reported) insertData.time_reported = time_reported;
    if (reported_to) insertData.reported_to = reported_to;
    if (complaint_received_by) insertData.complaint_received_by = complaint_received_by;
    if (priority) insertData.priority = priority;
    if (resident_id) insertData.resident_id = resident_id;

    try {
        // Create ticket in database
        const ticket = await createTicketRecord(insertData);

        // Get resident phone and notify admins
        const ticketData = await getTicketWithContacts(ticket.id);
        if (ticketData) {
            await notifyAdmins(
                `New Ticket Created
Ticket ID: ${ticket_id}
Complaint: ${complaint}
Resident: ${resident_name}
Location: ${location}
Job Type: ${job_type}`
            );
        }

        return res.json({
            message: "Ticket created successfully",
            ticket: ticket
        });
    } catch (error) {
        console.error("Insert error details:", error);
        return res.status(500).json({
            error: error.message,
            details: error.details,
            hint: error.hint
        });
    }
};

// CONTROLLER: ADMIN ASSIGNS TECHNICIAN TO TICKET

export const assignTechnician = async (req, res) => {
    const { ticket_id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
        return res.status(400).json({ error: "technician_id is required" });
    }

    try {
        // Step 1: Verify technician exists and get their details
        const technician = await getTechnicianProfile(technician_id);
        if (!technician) {
            return res.status(404).json({ error: "Technician not found or has no profile" });
        }

        // Step 2: Update ticket with technician info
        const ticketData = await assignTechnicianToTicket(ticket_id, technician.technician_name);

        // Step 3: Send SMS to Technician
        await notifyUser(
            technician.technician_phone,
            `New Ticket Assigned to You
Ticket ID: ${ticket_id}
Job: ${ticketData.job_type}
Location: ${ticketData.location}
Issue: ${ticketData.complaint}`
        );

        // Step 4: Get ticket contact info and notify resident
        const ticketContacts = await getTicketWithContacts(ticketData.id);
        if (ticketContacts) {
            await notifyUser(
                ticketContacts.resident.resident_phone,
                `Your ticket #${ticket_id} has been assigned to ${technician.technician_name}. They will contact you shortly.`
            );
        }

        res.json({
            message: "Technician assigned successfully",
            assignment: {
                ticket_id: ticket_id,
                technician_name: technician.technician_name,
                technician_phone: technician.technician_phone,
                status: "assigned"
            }
        });
    } catch (error) {
        return res.status(404).json({
            error: error.message
        });
    }
};

// CONTROLLER: TECHNICIAN UPDATES STATUS

export const updateTicketStatus = async (req, res) => {
    const { ticket_id } = req.params;
    const { status, remarks, completed_date } = req.body;

    // Valid status values
    const validStatuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];

    if (!status) {
        return res.status(400).json({ error: "status is required" });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }

    const updateData = { status };

    // Add optional fields if provided
    if (remarks) updateData.remarks = remarks;
    if (completed_date) updateData.completed_date = completed_date;

    // If status is resolved or closed, set completed_date automatically
    if ((status === "resolved" || status === "closed") && !completed_date) {
        updateData.completed_date = new Date();
    }

    try {
        // Update ticket status
        await updateTicketStatusRecord(ticket_id, updateData);

        // Get ticket and contact info
        const ticket = await getTicketByTicketId(ticket_id);

        if (ticket) {
            const ticketData = await getTicketWithContacts(ticket.id);

            if (ticketData) {
                // SMS to Resident
                await notifyUser(
                    ticketData.resident.resident_phone,
                    `Your ticket #${ticket_id} status is now: ${status.toUpperCase()}`
                );
            }
        }

        res.json({ message: "Ticket status updated successfully", status });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};