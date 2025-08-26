import express from 'express';
import { createNewChat, getMessagesByChat } from '../controllers/chat.js';
import { isAuth } from '../middleware/isAuth.js';
import { get } from 'mongoose';
import { getUserChats } from '../controllers/chat.js';
import { upload } from '../middleware/multer.js';
import { sendMessage } from '../controllers/chat.js';

const router = express.Router();

router.post("/chat/new", isAuth, createNewChat);
router.get("/chats/all", isAuth, getUserChats);
router.post("/message", isAuth, upload.single('image'), sendMessage); // New route for sending messages with optional image upload
router.get("/message/:chatId", isAuth, getMessagesByChat);


export default router;


