import express from "express";
import { addTicketReview, getTicketReview,getMyReviews } from "../../controllers/ticketReview.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const ticketReviewRouter = express.Router();

// Specific routes MUST be defined BEFORE dynamic routes (/:ticketId)
ticketReviewRouter.get("/my-reviews", authenticate, checkRole("technician"), getMyReviews);

// Dynamic routes come last
ticketReviewRouter.post("/:ticketId",authenticate,checkRole("resident"), addTicketReview);
ticketReviewRouter.get("/:ticketId",authenticate,checkRole("resident","admin","technician"), getTicketReview);
export default ticketReviewRouter;