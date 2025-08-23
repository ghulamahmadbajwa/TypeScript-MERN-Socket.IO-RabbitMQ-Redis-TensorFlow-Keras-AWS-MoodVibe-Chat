import tryCatch from "../confiq/TryCatch.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/messages.js";
import axios from "axios";
/**
 * Controller: createNewChat
 * -------------------------
 * Purpose:
 * - Starts a new chat between two users (the logged-in user and a receiver).
 * - Prevents duplicate chats from being created for the same two people.
 *
 * Flow:
 * - Get the logged-in user (from req.user, set by isAuth middleware).
 * - Get the other user's ID (receiver) from the request body.
 * - Check if a chat already exists between them.
 * - If it exists → return that chat.
 * - If not → create a new chat and return its ID.
 */
export const createNewChat = tryCatch(async (req, res) => {
    // Step 1: Get the ID of the currently logged-in user.
    // req.user is available because isAuth middleware already verified the JWT.
    const userId = req.user?._id;
    // Step 2: Extract the receiver's ID from the request body.
    const { receiverId } = req.body;
    // Step 3: Validate input — receiverId is required.
    if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
    }
    // Step 4: Check if a chat already exists between the two users.
    // - "$all: [userId, receiverId]" → ensures both IDs are present in the array.
    // - "size: 2" → ensures that ONLY these two users are in this chat.
    const existingChat = await Chat.findOne({
        user: { $all: [userId, receiverId], $size: 2 } // (typo fixed: $size instead of size)
    });
    // Step 5: If chat already exists, return that instead of making a new one.
    if (existingChat) {
        return res.json({
            message: "Chat already exists",
            chatId: existingChat._id
        });
    }
    // Step 6: If no existing chat, create a new chat with both users.
    const newChat = await Chat.create({
        user: [userId, receiverId],
    });
    // Step 7: Return success response with new chat ID.
    res.status(201).json({
        message: "New chat created successfully",
        chatId: newChat._id
    });
});
export const getUserChats = tryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    // Find all chats that include the logged-in user.
    const chats = await Chat.find({
        user: userId
    }).sort({ updatedAt: -1 }); // Sort by most recently updated first.
    // Map through chats and fetch user + unseen count
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.user.find((id) => id !== userId);
        // Count unseen messages
        const unseenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId }, // Messages not sent by me
            seen: false // Not seen yet
        });
        // Fetch other user details
        try {
            const { data } = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`);
            return {
                user: data, // Assuming the user service returns    
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestmessage || null,
                    unseenCount,
                },
            };
        }
        catch (error) {
            console.error("Error fetching user data:", error);
            return {
                user: { _id: otherUserId, name: "unknown user" }, // If there's an error, we can return null or handle it as needed
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestmessage || null,
                    unseenCount,
                },
            };
        }
    }));
    res.json({
        chats: chatWithUserData
    });
});
//# sourceMappingURL=chat.js.map