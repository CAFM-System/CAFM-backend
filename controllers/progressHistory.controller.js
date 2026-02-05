import { getProgressHistoryByTicketId, addProgressHistoryEntry } from "../models/progressHistory.model.js";
import { getTicketById } from "../models/ticket.Model.js";



const getProgressHistory = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!ticketId) return res.status(400).json({ message: "Ticket ID is required" });

        const history = await getProgressHistoryByTicketId(ticketId);

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch progress history", error: error.message });
    }
}

const addProgressHistory = async (req, res) => {
    try {
        const progressData = req.body;

        if (!progressData || !progressData.ticket_id || !progressData.status || !progressData.updated_by || !progressData.message)
            return res.status(400).json({ message: "Incomplete progress history data" });

        await addProgressHistoryEntry(progressData);

        
        
        


        res.status(201).json({ message: "Progress history entry added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to add progress history entry", error: error.message });
    }
}

export { getProgressHistory, addProgressHistory };