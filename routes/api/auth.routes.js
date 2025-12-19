import express from "express";
import { login,getMe,logout } from "../../controllers/auth.controller.js";
import authenticate from "../../middlewares/auth.js";   

const authRouter = express.Router();

// POST /api/auth/login
authRouter.post("/login", login);

// GET /api/auth/me
authRouter.get("/me", authenticate, getMe);

// POST /api/auth/logout - User logout (Protected)
authRouter.post("/logout", authenticate, logout);



export default authRouter;
