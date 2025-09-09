import mongoose, { Document, Schema } from "mongoose";
/**
 * SchemaChat
 * -----------
 * - Defines the MongoDB schema for the Chat collection.
 * - Fields correspond to the IChat interface.
 */
const SchemaChat = new Schema({
    user: [
        {
            type: String,
            required: true, // Every chat must have at least one user
        },
    ],
    latestmessage: {
        text: {
            type: String, // Optional last message text
        },
        sender: {
            type: String, // Optional last message sender
        },
    },
}, { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);
/**
 * Chat Model
 * -----------
 * - Mongoose model representing the "Chat" collection.
 * - Allows querying, creating, updating chat documents.
 */
export const Chat = mongoose.model("Chat", SchemaChat);
//# sourceMappingURL=Chat.js.map