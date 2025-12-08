import express from 'express';
import { getProgressHistory, addProgressHistory } from '../../controllers/progressHistory.controller.js';

const router = express.Router();

router.get('/:ticketId', getProgressHistory);

router.post('/', addProgressHistory);

export default router;