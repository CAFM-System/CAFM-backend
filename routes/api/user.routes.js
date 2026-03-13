import express from 'express';
import { getAllResidents, getAllTechnicians } from '../../controllers/user.controller.js';
import authenticate from '../../middlewares/auth.js';
import checkRole from '../../middlewares/roleCheck.js';

const userRouter = express.Router();

userRouter.get('/technicians',authenticate,checkRole("admin"),getAllTechnicians);
userRouter.get('/residents',authenticate,checkRole("admin","frontdesk"),getAllResidents);

export default userRouter;