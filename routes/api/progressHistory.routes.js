import express from 'express';
import { getProgressHistory, addProgressHistory } from '../../controllers/progressHistory.controller.js';
import authenticate from '../../middlewares/auth.js';
import checkRole from '../../middlewares/roleCheck.js';

const router = express.Router();

router.get('/:ticketId',authenticate, getProgressHistory);

router.post('/',authenticate,checkRole("admin","technician","resident"), addProgressHistory);

export default router;