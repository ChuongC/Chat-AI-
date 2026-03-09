import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes         from './routes/users.js';
import conversationRoutes from './routes/conversations.js';
import chatRoutes         from './routes/chats.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes  
app.use('/',             userRoutes);
app.use('/conversations', conversationRoutes);
app.use('/',             chatRoutes);   // mounts as /chat and /chat-history

// ── Centralized error handler 
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));