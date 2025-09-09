import express from 'express';
import { createNewChat, getMessagesByChat, getUserChats, sendMessage } from '../controllers/chat.js';
import { isAuth } from '../middleware/isAuth.js'; // Middleware to protect routes
import { upload } from '../middleware/multer.js'; // Middleware to handle file uploads (images)
const router = express.Router();
/**
 * Route: Create a new chat
 * ------------------------
 * Method: POST
 * URL: /api/v1/chat/new
 * Middleware: isAuth → ensures user is logged in
 * Controller: createNewChat → handles creating a new chat
 */
router.post("/chat/new", isAuth, createNewChat);
/**
 * Route: Get all chats of the logged-in user
 * ------------------------------------------
 * Method: GET
 * URL: /api/v1/chats/all
 * Middleware: isAuth → ensures user is logged in
 * Controller: getUserChats → fetches all chats, latest messages, unseen counts
 */
router.get("/chats/all", isAuth, getUserChats);
/**
 * Route: Send a new message
 * -------------------------
 * Method: POST
 * URL: /api/v1/message
 * Middleware:
 *   - isAuth → ensures user is logged in
 *   - upload.single('image') → handles optional image upload via form-data with field 'image'
 * Controller: sendMessage → saves message (text or image) to DB and updates chat's latest message
 */
router.post("/message", isAuth, upload.single('image'), sendMessage);
/**
 * Route: Get all messages for a chat
 * ----------------------------------
 * Method: GET
 * URL: /api/v1/message/:chatId
 * Middleware: isAuth → ensures user is logged in
 * Controller: getMessagesByChat → fetches all messages in the chat and marks unseen messages as seen
 */
router.get("/message/:chatId", isAuth, getMessagesByChat);
export default router;
//# sourceMappingURL=chat.js.map