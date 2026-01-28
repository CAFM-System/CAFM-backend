import express from "express";
import { preRegisterVisitor, scanVisitorQr } from "../../controllers/visitor.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const visitorRouter = express.Router();

visitorRouter.post("/pre-register",authenticate,checkRole("resident"),preRegisterVisitor);
visitorRouter.post("/scan",authenticate,scanVisitorQr);

export default visitorRouter;