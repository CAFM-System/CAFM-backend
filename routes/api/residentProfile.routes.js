import express from "express";
import {
  getProfile,
  updateProfile,
} from "../../controllers/residentProfile.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const residentProfileRouter = express.Router();

// All routes require JWT auth + resident role
residentProfileRouter.use(authenticate, checkRole("resident"));

residentProfileRouter.get("/", getProfile);
residentProfileRouter.put("/", updateProfile);

export default residentProfileRouter;
