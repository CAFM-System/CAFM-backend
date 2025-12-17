import express from "express";
import { addTicketReview } from "../../controllers/ticketReview.controller.js";

const ticketReviewRouter = express.Router();

ticketReviewRouter.post("/", addTicketReview);

export default ticketReviewRouter;