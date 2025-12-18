import express from "express";
import { login,getMe } from "../../controllers/auth.controller.js";
import authenticate from "../../middlewares/auth.js";   

const authRouter = express.Router();

// POST /api/auth/login
authRouter.post("/login", login);

// GET /api/auth/me
authRouter.get("/me", authenticate, getMe);



export default authRouter;
