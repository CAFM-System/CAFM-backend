import { getAllTickets } from "../models/ticket.Model.js";

const diplayAllTickets = async (req, res) => {
    try {
          const tickets = await getAllTickets();
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

export { diplayAllTickets };