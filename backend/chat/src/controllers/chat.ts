import { getRecieverSoketId, io } from "../confiq/socket.js";
import tryCatch from "../confiq/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/messages.js";
import axios from "axios";

// === Controller: createNewChat ===
// Purpose: Initiates a new chat between the logged-in user and another user (receiver).
// Key Logic: 
// - Extracts user IDs and checks for duplicates to avoid creating redundant chats.
// - Creates a new chat document if none exists and returns its ID.
export const createNewChat = tryCatch(async (req: AuthenticatedRequest, res) => {
    // Extract logged-in user's ID from JWT (via isAuth middleware)
    const userId = req.user?._id;
    // Extract receiver's ID from request body
    const { receiverId } = req.body;

    // Validation: Ensure receiverId is provided
    if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Check for existing chat between these two users
    // $all ensures both userId and receiverId are in the chat, $size ensures exactly two users
    const existingChat = await Chat.findOne({
        user: { $all: [userId, receiverId], $size: 2 }
    });

    // If chat exists, return its ID and avoid creating a duplicate
    if (existingChat) {
        return res.json({
            message: "Chat already exists",
            chatId: existingChat._id
        });
    }

    // Create a new chat with the two users
    const newChat = await Chat.create({
        user: [userId, receiverId],
    });

    // Respond with success and the new chat's ID
    res.status(201).json({
        message: "New chat created successfully",
        chatId: newChat._id
    });
});

// === Controller: getUserChats ===
// Purpose: Retrieves all chats for the logged-in user, including details about other users and unseen message counts.
// Key Logic:
// - Fetches chats involving the user, sorted by most recent.
// - Enriches each chat with other user's info (via external API) and unseen message count.
export const getUserChats = tryCatch(async (req: AuthenticatedRequest, res) => {
    // Extract logged-in user's ID from JWT
    const userId = req.user?._id;

    // Validation: Ensure userId is available
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Fetch all chats where the user is a participant, sorted by most recent update
    const chats = await Chat.find({ user: userId }).sort({ updatedAt: -1 });

    // Process each chat to include additional data (other user info, unseen messages)
    const chatWithUserData = await Promise.all(
        chats.map(async (chat) => {
            // Identify the other user in the chat (not the logged-in user)
            const otherUserId = chat.user.find((id) => id.toString() !== userId.toString());

            // Handle case where other user ID is not found
            if (!otherUserId) {
                return {
                    user: { _id: "unknown", name: "unknown user" },
                    chat: chat.toObject()
                };
            }

            // Count unseen messages sent by the other user in this chat
            const unseenCount = await Messages.countDocuments({
                chatId: chat._id,
                sender: { $ne: userId },
                seen: false
            });

            try {
                // Fetch other user's details from external user service via API
                const { data } = await axios.get(
                    `${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`
                );

                // Return enriched chat data with user info, latest message, and unseen count
                return {
                    user: data,
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestmessage || null,
                        unseenCount,
                    },
                };
            } catch (error) {
                // Log error and return minimal user info if user service fails
                console.error("Error fetching user data:", error);
                return {
                    user: { _id: otherUserId, name: "unknown user" },
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestmessage || null,
                        unseenCount,
                    },
                };
            }
        })
    );

    // Respond with the enriched chat data
    res.json({ chats: chatWithUserData });
});

// === Controller: sendMessage ===
// Purpose: Handles sending a new message (text or image) in a chat and updates the chat's latest message.
// Key Logic:
// - Validates input, checks user permissions, and handles real-time notifications via Socket.IO.
// - Updates chat metadata and emits events to notify users.
export const sendMessage = tryCatch(async (req: AuthenticatedRequest, res) => {
    // Extract sender's ID from JWT and message details from request
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file; // Image file uploaded via Multer + Cloudinary

    // Validation: Ensure required fields are present
    if (!senderId) return res.status(400).json({ message: "Sender ID is required" });
    if (!chatId) return res.status(400).json({ message: "Chat ID is required" });
    if (!text && !imageFile) return res.status(400).json({ message: "Message content or image is required" });

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Ensure sender is a participant in the chat
    if (!chat.user.some((u) => u.toString() === senderId.toString())) {
        return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    // Identify the receiver (other user in the chat)
    const otherUserId = chat.user.find((u) => u.toString() !== senderId.toString());
    if (!otherUserId) return res.status(400).json({ message: "Cannot find the receiver ID" });

    // Check if receiver is connected and in the chat room (for real-time updates)
    const recieverSoketId = getRecieverSoketId(otherUserId.toString());
    let isRecieverInChatRoom = false;

    if (recieverSoketId) {
        const recieverSoket = io.sockets.sockets.get(recieverSoketId);
        if (recieverSoket && recieverSoket.rooms.has(chatId)) {
            isRecieverInChatRoom = true;
        }
    }

    // Build message object with conditional fields for text or image
    const messageData: any = {
        chatId,
        sender: senderId,
        seen: isRecieverInChatRoom, // Mark as seen if receiver is in chat
        seenAt: isRecieverInChatRoom ? new Date() : undefined,
        messageType: imageFile ? "image" : "text",
        text: text || null,
    };

    // Add image details if an image was uploaded
    if (imageFile) {
        messageData.image = {
            url: imageFile.path,
            public_id: imageFile.filename,
        };
    }

    // Save the message to the database
    const message = new Messages(messageData);
    const savedMessage = await message.save();

    // Update chat's latest message (text or image indicator)
    const latestMessageText = imageFile
        ? (text ? `🖼️ ${text}` : "🖼️ Image")
        : text;
    await Chat.findByIdAndUpdate(chatId, {
        latestmessage: { text: latestMessageText, sender: senderId },
        updatedAt: new Date(),
    });

    // Emit real-time events to notify users
    console.log(`🔍 DEBUG: Emitting newMessage to chat room ${chatId}`);
    io.to(chatId).emit("newMessage", savedMessage); // Notify chat room
    
    if (recieverSoketId) {
        console.log(`🔍 DEBUG: Emitting newMessage to receiver socket ${recieverSoketId}`);
        io.to(recieverSoketId).emit("newMessage", savedMessage); // Notify receiver
    } else {
        console.log(`🔍 DEBUG: Receiver ${otherUserId} is not online`);
    }
    
    const senderSoketId = getRecieverSoketId(senderId.toString());
    if (senderSoketId) {
        console.log(`🔍 DEBUG: Emitting newMessage to sender socket ${senderSoketId}`);
        io.to(senderSoketId).emit("newMessage", savedMessage); // Notify sender
    } else {
        console.log(`🔍 DEBUG: Sender ${senderId} is not online`);
    }

    // If receiver is in chat, notify sender that message was seen
    if (isRecieverInChatRoom && senderSoketId) {
        io.to(senderSoketId).emit("messagesSeen", {
            chatId: chatId,
            seenBy: otherUserId,
            messageIds: [savedMessage._id],
        });
    }

    // Respond with success and message details
    res.status(201).json({
        message: "Message sent successfully",
        messageData: savedMessage,
        chat: await Chat.findById(chatId),
        sender: senderId,
    });
});

// === Controller: getMessagesByChat ===
// Purpose: Retrieves all messages for a specific chat and marks unseen messages as seen.
// Key Logic:
// - Validates user access, fetches messages, and updates seen status.
// - Fetches other user's info and emits real-time seen events.
export const getMessagesByChat = tryCatch(async (req: AuthenticatedRequest, res) => {
    // Extract user ID and chat ID from request
    const userId = req.user?._id;
    const { chatId } = req.params;

    // Validation: Ensure required fields are present
    if (!userId) return res.status(400).json({ message: "Unauthorized" });
    if (!chatId) return res.status(400).json({ message: "Chat ID is required" });

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Ensure user is a participant in the chat
    const isUserInChat = chat.user.some((id) => id.toString() === userId.toString());
    if (!isUserInChat) return res.status(403).json({ message: "You are not a participant in this chat" });

    // Find unseen messages from other users in this chat
    const messagesToMarkSeen = await Messages.find({
        chatId,
        sender: { $ne: userId },
        seen: false,
    });

    // Mark unseen messages as seen with current timestamp
    await Messages.updateMany(
        { chatId, sender: { $ne: userId }, seen: false },
        { seen: true, seenAt: new Date() }
    );

    // Fetch all messages for the chat, sorted oldest to newest
    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });

    // Identify the other user in the chat
    const otherUserId = chat.user.find((id) => id.toString() !== userId.toString());

    // Handle case where other user ID is not found
    if (!otherUserId) {
        return res.json({
            messages,
            user: { _id: "unknown", name: "unknown user" },
        });
    }

    try {
        // Fetch other user's details from external user service
        const { data } = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`);

        // Notify other user of seen messages via Socket.IO
        if (messagesToMarkSeen.length > 0) {
            console.log(`🔍 DEBUG: Found ${messagesToMarkSeen.length} messages to mark as seen`);
            const otherUserSoketId = getRecieverSoketId(otherUserId.toString());
            console.log(`🔍 DEBUG: Other user socket ID: ${otherUserSoketId}`);
            if (otherUserSoketId) {
                const seenData = {
                    chatId,
                    seenBy: userId,
                    messageIds: messagesToMarkSeen.map((m) => m._id),
                };
                console.log(`🔍 DEBUG: Emitting messagesSeen to socket ${otherUserSoketId}:`, seenData);
                io.to(otherUserSoketId).emit("messagesSeen", seenData);
            } else {
                console.log(`🔍 DEBUG: Other user ${otherUserId} is not online, cannot emit messagesSeen`);
            }
        } else {
            console.log(`🔍 DEBUG: No messages to mark as seen`);
        }

        // Respond with messages and other user's info
        res.json({ messages, user: data });
    } catch (error) {
        // Log error and return minimal user info if user service fails
        console.error("Error fetching user data:", error);
        res.json({
            messages,
            user: { _id: otherUserId, name: "unknown user" },
        });
    }
});