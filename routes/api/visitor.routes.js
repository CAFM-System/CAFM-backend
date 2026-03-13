import express from "express";
import { fetchvisitors, fetchvisitorsByResident, onSiteVisitorRegistration, preRegisterVisitor, scanVisitorQr, updateVisitor, deleteVisitor } from "../../controllers/visitor.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const visitorRouter = express.Router();

visitorRouter.post("/pre-register", authenticate, checkRole("resident"), preRegisterVisitor);
visitorRouter.post("/scan", authenticate, scanVisitorQr);
visitorRouter.get("/", authenticate, fetchvisitors);
visitorRouter.get("/my-visitors", authenticate, checkRole("resident"), fetchvisitorsByResident);
visitorRouter.post("/onsite-register", authenticate, checkRole("frontdesk"), onSiteVisitorRegistration);
visitorRouter.put("/", authenticate, checkRole("resident"), updateVisitor);
visitorRouter.delete("/", authenticate, checkRole("resident"), deleteVisitor);

export default visitorRouter;