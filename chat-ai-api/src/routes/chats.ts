import { Router } from 'express';
import { chat, history } from '../controllers/chatController.js';
import { validateUser } from '../middleware/validateUser.js';

const router = Router();

// Exact original URLs preserved
router.post('/chat',         validateUser, chat);
router.post('/chat-history', validateUser, history);

export default router;