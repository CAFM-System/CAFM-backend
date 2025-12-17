import { getTicketById } from "../models/ticket.Model.js";
import { getReviewsByTicketId, insertTicketReview } from "../models/ticketReview.model.js";

const addTicketReview = async (req, res)=>{
    try {
        const { ticketId, rating, review} = req.body;
        const residentId = req.user.id;

        if(!ticketId || !rating){
            return res.status(400).json({ message: "ticketId, rating  are required" });
        }

        const ticket = await getTicketById(ticketId);
        if(!ticket){
            return res.status(404).json({ message: "Ticket not found" });
        }

        if(ticket.status !== "resolved"){
            return res.status(400).json({ message: "Cannot review a ticket that is not resolved" });
        }

        const reviewData = {
            ticket_id: ticketId,
            resident_id: residentId,
            technician_id: ticket.technician_id,
            rating,
            review
        }

        await insertTicketReview(reviewData);
        res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getTicketReview = async (req, res)=>{
    try {
        const { ticketId } = req.params;

        const review = await getReviewsByTicketId(ticketId);
        if(!review){
            return res.status(404).json({ message: "Review not found for this ticket" });
        }
        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { addTicketReview, getTicketReview };