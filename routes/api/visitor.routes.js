import express from "express";
import { preRegisterVisitor } from "../../controllers/visitor.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const visitorRouter = express.Router();

visitorRouter.post("/",authenticate,checkRole("resident"),preRegisterVisitor);

export default visitorRouter;