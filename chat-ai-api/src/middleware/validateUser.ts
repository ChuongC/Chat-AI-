import type { Request, Response, NextFunction } from 'express';
import { findUserById } from '../services/userService.js';

/**
 * Confirms the userId in req.body exists in the database.
 * By the time any chat/conversation route is called, the frontend
 * will have already called /frappe-auth on mount, so a missing or
 * unknown userId here means the client skipped that step.
 */
export async function validateUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required. Ensure /frappe-auth was called on mount.' });
    }

    const user = await findUserById(userId);
    if (!user) {
        return res.status(401).json({ message: 'Unrecognised user. Call /frappe-auth first.' });
    }

    next();
}