import type { Request, Response } from 'express';
import * as conversationService from '../services/conversationService.js';

export async function list(req: Request, res: Response): Promise<any> {
    try {
        const data = await conversationService.getConversationsByUser(req.body.userId);
        res.status(200).json({ conversations: data });
    } catch {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
}

export async function create(req: Request, res: Response): Promise<any> {
    try {
        const conversation = await conversationService.createConversation(req.body.userId, req.body.name);
        res.status(201).json({ conversation });
    } catch {
        res.status(500).json({ message: 'Error creating conversation' });
    }
}

export async function rename(req: Request, res: Response): Promise<any> {
    const { userId, conversationId, name } = req.body;

    if (!conversationId || !name?.trim()) {
        return res.status(400).json({ message: 'conversationId and name are required' });
    }

    try {
        const conversation = await conversationService.renameConversation(userId, conversationId, name);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        res.status(200).json({ conversation });
    } catch {
        res.status(500).json({ message: 'Error renaming conversation' });
    }
}

export async function remove(req: Request, res: Response): Promise<any> {
    const { userId, conversationId } = req.body;

    if (!conversationId) {
        return res.status(400).json({ message: 'conversationId is required' });
    }

    try {
        const deleted = await conversationService.deleteConversation(userId, conversationId);
        if (!deleted) return res.status(404).json({ message: 'Conversation not found' });
        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch {
        res.status(500).json({ message: 'Error deleting conversation' });
    }
}