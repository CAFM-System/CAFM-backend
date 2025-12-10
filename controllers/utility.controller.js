import generatePDF from "../utils/generatePDF.js";
import { getAllTickets, getTicketsByCreatedMonth } from "../models/ticket.Model.js";
import fs from "fs";

/**
 * Transforms ticket data into a printable format with formatted column names
 * @param {Array<Object>} tickets - Array of ticket objects from the database
 * @returns {Array<Object>} Array of tickets with readable column headers and formatted dates
 */
const createPrintableTicketsData = (tickets) => {
    return tickets.map(ticket => {
        return {
            "TICKET ID": ticket.ticket_id,
            "DATE RECEIVED": new Date(ticket.created_at).toLocaleDateString(),
            "TIME RECEIVED": new Date(ticket.created_at).toLocaleTimeString(),
            "COMPLAINT": ticket.complaint,
            "LOCATION": ticket.location,
            "NAME": ticket.resident_name,
            "COMPLAINT CATEGORY": ticket.complaint_category,
            "JOB TYPE": ticket.job_type,
            "COMPLAINT RECEIVED BY": ticket.complaint_received_by,
            "TIME REPORTED": new Date(ticket.time_reported).toLocaleTimeString(),
            "REPORTED TO": ticket.reported_to,
            "DATE COMPLETED": new Date(ticket.completed_date).toLocaleString(),
            "STATUS": ticket.status,
            "REMARKS": ticket.remarks
        };
    });
}

/**
 * Generates a PDF report of tickets based on specified criteria
 * @async
 * @param {Object} req - Express request object { by, year, month, status }
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Downloads the generated PDF file or returns an error response
 * @throws {Error} Returns 400 if required parameters are missing
 * @throws {Error} Returns 404 if no tickets match the criteria
 * @throws {Error} Returns 500 if PDF generation or download fails
 */
const generateTicketsPDF = async (req, res) => {
    try {
        let tickets = [];
        const { by, year, month, status } = req.body;

        if (!by || !year || !month || !status) return res.status(400).json({ message: "Missing required parameters" });

        if (by === "year") tickets = await getAllTickets();
        else if (by === "month") tickets = await getTicketsByCreatedMonth(year, month);

        const printableTickets = createPrintableTicketsData(tickets);

        if (!printableTickets || printableTickets.length === 0) {
            return res.status(404).json({ message: "No tickets found for the specified criteria" });
        }

        const filePath = await generatePDF(printableTickets, req.body);

        res.download(filePath, (error) => {
            if (error) {
                console.error("Error sending file:", error);
                res.status(500).json({ message: "Error downloading the file", error: error.message });
            }

            setTimeout(() => {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Delete error:", unlinkErr);
                    else console.log(`Deleted: ${filePath}`);
                });
            }, 1000 * 60);
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to generate PDF", error: error.message });
    }
}

export { generateTicketsPDF };