import type { Request, Response } from 'express';
import { sendMessage, getChatHistory } from '../services/chatService.js';

export async function chat(req: Request, res: Response): Promise<any> {
    const { userId, message, conversationId } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'message is required' });
    }

    try {
        const reply = await sendMessage(userId, message, conversationId);
        res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Error generating AI response' });
    }
}

export async function history(req: Request, res: Response): Promise<any> {
    const { userId, conversationId } = req.body;

    try {
        const messages = await getChatHistory(userId, conversationId);
        res.status(200).json({ message: messages });
    } catch {
        res.status(500).json({ message: 'Error fetching chat history' });
    }
}