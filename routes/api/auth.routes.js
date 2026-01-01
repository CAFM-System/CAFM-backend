import express from "express";
import { login, getMe, logout, forgotPassword,resetPassword } from "../../controllers/auth.controller.js";
import authenticate from "../../middlewares/auth.js";   

const authRouter = express.Router();

// POST /api/auth/login
authRouter.post("/login", login);

// GET /api/auth/me
authRouter.get("/me", authenticate, getMe);

// POST /api/auth/logout - User logout (Protected)
authRouter.post("/logout", authenticate, logout);

// POST /api/auth/forgot-password - Send password reset email
authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password", resetPassword);


export default authRouter;