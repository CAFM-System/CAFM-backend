import express from "express";
import { addTicketReview, getTicketReview } from "../../controllers/ticketReview.controller.js";

const ticketReviewRouter = express.Router();

ticketReviewRouter.post("/", addTicketReview);
ticketReviewRouter.get("/:ticketId", getTicketReview);
export default ticketReviewRouter;