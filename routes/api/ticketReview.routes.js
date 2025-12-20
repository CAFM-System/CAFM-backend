import express from "express";
import { addTicketReview, getTicketReview } from "../../controllers/ticketReview.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const ticketReviewRouter = express.Router();

ticketReviewRouter.post("/",authenticate,checkRole("resident"), addTicketReview);
ticketReviewRouter.get("/:ticketId",authenticate,checkRole("resident","admin","technician"), getTicketReview);
export default ticketReviewRouter;