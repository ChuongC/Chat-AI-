import { Router } from 'express';
import { list, create, rename, remove } from '../controllers/conversationController.js';
import { validateUser } from '../middleware/validateUser.js';

const router = Router();

// validateUser runs before every conversation route
router.post('/',        validateUser, list);
router.post('/create',  validateUser, create);
router.post('/rename',  validateUser, rename);
router.post('/delete',  validateUser, remove);

export default router;