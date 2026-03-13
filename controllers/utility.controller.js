import { generatePDFforTickets, generatePDFforVisitors } from "../utils/generatePDF.js";
import { getAllTickets, getTicketsByCreatedMonth } from "../models/ticket.Model.js";
import { getVisitors } from "../models/visitor.model.js";
import { generateExcelForTickets, generateExcelForVisitors } from "../utils/generateExcel.js";
import fs from "fs";

const delete_timeout = 1000 * 60; // 1 minute

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

        if (by === "year") tickets = await getAllTickets(req.user);
        else if (by === "month") tickets = await getTicketsByCreatedMonth(year, month);

        const printableTickets = createPrintableTicketsData(tickets);

        if (!printableTickets || printableTickets.length === 0) {
            return res.status(404).json({ message: "No tickets found for the specified criteria" });
        }

        const filePath = await generatePDFforTickets(printableTickets, req.body);

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
            }, delete_timeout);
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to generate PDF", error: error.message });
    }
}

/** Generate Excel  report of tickets based on specified criteria */
const generateTicketsExcel = async (req, res) => {
    try {
        let tickets = [];
        const { by, year, month, status } = req.body;

        if (!by || !year || !month || !status) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        if (by === "year") tickets = await getAllTickets(req.user);
        else if (by === "month") tickets = await getTicketsByCreatedMonth(year, month);

        const printableTickets = createPrintableTicketsData(tickets);

        if (!printableTickets || printableTickets.length === 0) {
            return res.status(404).json({ message: "No tickets found for the specified criteria" });
        }

        const filePath = await generateExcelForTickets(printableTickets, req.body);

        res.download(filePath, (error) => {
            if (error) {
                console.error("Error sending file:", error);
                return res.status(500).json({ message: "Error downloading the file", error: error.message });
            }

            setTimeout(() => {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Delete error:", unlinkErr);
                    else console.log(`Deleted: ${filePath}`);
                });
            }, delete_timeout);
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate Excel", error: error.message });
    }
};

/* Visitor Management */

/**
 * 
 * @param {*} visitors 
 * @returns 
 */
const createPrntableVisitorData = (visitors) => {
    return visitors.map(visitor => {
        return {
            "VISITOR ID": visitor.id,
            "NAME": visitor.name,
            "HOST NAME": visitor.hostName || "N/A",
            "APARTMENT": visitor.hostApartment || "N/A",
            "PHONE": visitor.phone,
            "EMAIL": visitor.email,
            "NIC": visitor.nic,
            "VEHICLE NUMBER": visitor.vehicleNumber || "N/A",
            "OTHERS": visitor.othersCount || "N/A",
            "VISITOR TYPE": visitor.visitorType,
            "REGISTRATION": visitor.isPreRegistered ? "Yes" : "No",
            "ENTRY TIME": visitor.entryTime ? new Date(visitor.entryTime).toLocaleTimeString() : "N/A",
            "DATE": visitor.date ? new Date(visitor.date).toLocaleDateString() : "N/A",
            "HOST PHONE": visitor.hostPhone || "N/A",
        };
    });
}

const generateVisitorsPDF = async (req, res) => {
    console.log("Generating visitor PDF...");
    try {
        const visitors = await getVisitors();
        const printableVisitors = createPrntableVisitorData(visitors);

        if (!printableVisitors || printableVisitors.length === 0) {
            return res.status(404).json({ message: "No visitors found" });
        }

        const filePath = await generatePDFforVisitors(printableVisitors);

        res.download(filePath, (error) => {
            if (error) {
                console.error("Error sending file:", error);
                return res.status(500).json({ message: "Error downloading the file", error: error.message });
            }

            setTimeout(() => {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Delete error:", unlinkErr);
                    else console.log(`Deleted: ${filePath}`);
                });
            }, delete_timeout);
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to generate PDF", error: error.message });
    }
}

const generateVisitorsExcel = async (req, res) => {
    try {
        const visitors = await getVisitors();
        const printableVisitors = createPrntableVisitorData(visitors);

        if (!printableVisitors || printableVisitors.length === 0) {
            return res.status(404).json({ message: "No visitors found" });
        }

        const filePath = await generateExcelForVisitors(printableVisitors);

        res.download(filePath, (error) => {
            if (error) {
                console.error("Error sending file:", error);
                return res.status(500).json({ message: "Error downloading the file", error: error.message });
            }

            setTimeout(() => {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Delete error:", unlinkErr);
                    else console.log(`Deleted: ${filePath}`);
                });
            }, delete_timeout);
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate Excel", error: error.message });
    }
};

export { createPrntableVisitorData, generateTicketsPDF, generateTicketsExcel, generateVisitorsPDF, generateVisitorsExcel };