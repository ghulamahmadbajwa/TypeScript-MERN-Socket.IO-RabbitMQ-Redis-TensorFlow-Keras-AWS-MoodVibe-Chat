import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * IMessage Interface
 * -----------------
 * Defines the structure of a message document in MongoDB.
 */
export interface IMessage extends Document {
    chatId: Types.ObjectId; // Reference to the chat this message belongs to
    sender: string;         // ID of the user who sent the message
    text?: string;           // Optional text content of the message
    image?: {                // Optional image content
        url: string;         // URL of the uploaded image
        publicId: string;    // Public ID for image management (e.g., Cloudinary)
    };
    messageType: "text" | "image"; // Type of message (text or image)
    seen: boolean;            // Whether the receiver has seen the message
    seenAt?: Date;            // Timestamp when the message was marked as seen
    createdAt: Date;          // Timestamp of creation (auto-managed)
    updatedAt: Date;          // Timestamp of last update (auto-managed)
}

/**
 * messageSchema
 * -------------
 * Mongoose schema that defines how messages are stored in MongoDB.
 */
const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: String, required: true },
    text: String, // Optional text content
    image: {
      url: String,       // Image URL if message is an image
      publicId: String,  // Public ID for managing image (Cloudinary or similar)
    },
    messageType: {
      type: String,
      enum: ["text", "image"], // Ensures only "text" or "image" are valid
      default: "text",
    },
    seen: { type: Boolean, default: false }, // Default: message not seen
    seenAt: { type: Date, default: null },  // Null until message is seen
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

/**
 * Messages Model
 * --------------
 * Mongoose model representing the "Messages" collection.
 * - Allows creating, reading, updating, and querying message documents.
 */
export const Messages = mongoose.model<IMessage>("Messages", messageSchema);
