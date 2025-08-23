import express from 'express';
import { createNewChat } from '../controllers/chat.js';
import { isAuth } from '../middleware/isAuth.js';
import { get } from 'mongoose';
import { getUserChats } from '../controllers/chat.js';
const router = express.Router();
router.post("/chat/new", isAuth, createNewChat);
router.get("/chats/all", isAuth, getUserChats);
export default router;
//# sourceMappingURL=chat.js.map