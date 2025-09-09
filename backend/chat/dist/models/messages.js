import mongoose, { Document, Schema, Types } from "mongoose";
/**
 * messageSchema
 * -------------
 * Mongoose schema that defines how messages are stored in MongoDB.
 */
const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: String, required: true },
    text: String, // Optional text content
    image: {
        url: String, // Image URL if message is an image
        publicId: String, // Public ID for managing image (Cloudinary or similar)
    },
    messageType: {
        type: String,
        enum: ["text", "image"], // Ensures only "text" or "image" are valid
        default: "text",
    },
    seen: { type: Boolean, default: false }, // Default: message not seen
    seenAt: { type: Date, default: null }, // Null until message is seen
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});
/**
 * Messages Model
 * --------------
 * Mongoose model representing the "Messages" collection.
 * - Allows creating, reading, updating, and querying message documents.
 */
export const Messages = mongoose.model("Messages", messageSchema);
//# sourceMappingURL=messages.js.map