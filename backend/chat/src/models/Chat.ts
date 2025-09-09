import mongoose, { Document, Schema } from "mongoose";

/**
 * IChat Interface
 * ----------------
 * - Defines the TypeScript type for a Chat document in MongoDB.
 * - Extends Mongoose's Document type for full type safety.
 */
export interface IChat extends Document {
  user: string[]; // Array of user IDs participating in the chat
  latestmessage: {
    text: string;   // Text of the last message sent
    sender: string; // ID of the user who sent the last message
  };
  createdAt: Date;  // Auto-managed timestamp when the chat is created
  updatedAt: Date;  // Auto-managed timestamp when the chat is updated
}

/**
 * SchemaChat
 * -----------
 * - Defines the MongoDB schema for the Chat collection.
 * - Fields correspond to the IChat interface.
 */
const SchemaChat = new Schema<IChat>(
  {
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
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

/**
 * Chat Model
 * -----------
 * - Mongoose model representing the "Chat" collection.
 * - Allows querying, creating, updating chat documents.
 */
export const Chat = mongoose.model<IChat>("Chat", SchemaChat);
