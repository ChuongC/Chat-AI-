import { Router } from 'express';
import { frappeAuth } from '../controllers/userController.js';

const router = Router();

router.post('/frappe-auth', frappeAuth);

export default router;