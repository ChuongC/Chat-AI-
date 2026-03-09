import type { Request, Response } from 'express';
import { autoRegisterFromFrappe } from '../services/userService.js';

/**
 * POST /frappe-auth
 *
 * Called automatically on ChatView mount.
 * The frontend passes the Frappe session values — the user never
 * fills in a form. On first visit the user is created; on subsequent
 * visits the existing record is returned. Either way, a fresh Stream
 * token is issued so the frontend can connect to Stream Chat.
 *
 * Expected body:
 *   { email: string, name: string }
 *   (sourced from frappe.session.user and frappe.boot.user_info.full_name)
 */
export async function frappeAuth(req: Request, res: Response): Promise<any> {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ message: 'email and name are required' });
    }

    if (email === 'Guest' || email.toLowerCase() === 'guest') {
        return res.status(401).json({ message: 'User is not logged in to Frappe CRM' });
    }

    try {
        const result = await autoRegisterFromFrappe(name, email);
        res.status(200).json(result);
    } catch (error) {
        console.error('[frappe-auth] Error:', error);
        res.status(500).json({ message: 'Authentication failed', detail: (error as Error).message });
    }
}