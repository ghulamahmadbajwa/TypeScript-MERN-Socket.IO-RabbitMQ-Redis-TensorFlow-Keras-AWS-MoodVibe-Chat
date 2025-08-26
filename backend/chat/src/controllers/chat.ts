import tryCatch from "../confiq/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
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
export const createNewChat = tryCatch(async (req: AuthenticatedRequest, res) => {
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
        })
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







export const getUserChats = tryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    // Find all chats that include the logged-in user.
    const chats = await Chat.find({
        user: userId
    }).sort({ updatedAt: -1 }); // Sort by most recently updated first.

    // Map through chats and fetch user + unseen count
    const chatWithUserData = await Promise.all(
        chats.map(async (chat) => {   // <-- make this async!
            const otherUserId = chat.user.find((id) => id !== userId);

            // Count unseen messages
            const unseenCount = await Messages.countDocuments({
                chatId: chat._id,
                sender: { $ne: userId }, // Messages not sent by me
                seen: false              // Not seen yet
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
            } catch (error) {
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

        })
    );

    res.json({
        chats: chatWithUserData
    });
});


export const sendMessage = tryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file; // Assuming you're using multer for file uploads

    if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
    }
    if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
    }
    if (!text && !imageFile) {
        return res.status(400).json({ message: "Message content or image is required" });

    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    const isUserInChat = chat.user.some((userId) => userId.toString() === senderId);
    if (!isUserInChat) {
        return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    const otherUserId = chat.user.find((userId) => userId.toString() !== senderId);
    if (!otherUserId) {
        return res.status(400).json({ message: "Cannot find the receiver id" });
    }

    //Socket setup

    let messageData: any = {
        chatId: chatId,
        sender: senderId,
        seen: false,
        seenAt: null,
    };

    if (imageFile) {
        messageData.image = {
            url: imageFile.path,
            public_id: imageFile.filename
        }
        messageData.messageType = "image";
        messageData.text = text || "";
    } else {
        messageData.text = text;
        messageData.messageType = "text";
    }
    const message = new Messages(messageData);
    const savedMessage = await message.save();
    const latestMessage = imageFile ? "🖼️ image " : text;
    await Chat.findByIdAndUpdate(chatId, {
        latestmessage: {
            text: latestMessage,
            sender: senderId,
        },
        updatedAt: new Date(),
    }, { new: true })

    // Emit socket event 

    res.status(201).json({
        message: "Message sent successfully",
        messageData: savedMessage,   // full saved message
        chat: await Chat.findById(chatId), // optional: include updated chat
        sender: senderId,
    })

});



export const getMessagesByChat = tryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "Unauthorized" });
    }
    if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    const isUserInChat = chat.user.some((id) => id === userId);
    if (!isUserInChat) {
        return res.status(403).json({ message: "You are not a participant in this chat" });
    }
    const messagesToMarkAsSeen = await Messages.find({
        chatId: chatId,
        sender: { $ne: userId },
        seen: false
    });
    await Messages.updateMany({
        chatId: chatId,
        sender: { $ne: userId },
        seen: false
    }, {
        seen: true,
        seenAt: new Date()
    });

    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 }); // Oldest first
    const otherUserId = chat.user.find((id) => id !== userId);

    try {
        const { data } = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`);
        if (!otherUserId) {
            return res.status(400).json({ message: "Cannot find the other user id" })
        }
        //socket to work 
        res.json({
            messages,
            user: data, // Assuming the user service returns the user object directly
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.json({
            messages,
            user: { _id: otherUserId, name: "unknown user" }, // If there's an error, we can return null or handle it as needed
        });
    }

});
