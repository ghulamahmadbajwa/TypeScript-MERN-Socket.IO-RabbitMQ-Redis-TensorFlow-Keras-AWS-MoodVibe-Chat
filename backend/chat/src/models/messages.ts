import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    chatId: Types.ObjectId; // Reference to the user who sent the message
    sender: string; // Reference to the user who receives the message
    text?: string; // The actual message content
    image?: {
        url: string; // URL of the image
        publicId: string; // Public ID for image management (e.g., in cloud storage)
    };
    messageType: "text" | "image"; // Type of the message
    seen: boolean; // Whether the message has been seen by the receiver
    seenAt?: Date; // Timestamp when the message was seen
    createdAt: Date; // Timestamp when the message was created
    updatedAt: Date; // Timestamp when the message was last updated
}


const messageSchema = new Schema<IMessage>({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: String, required: true },
    text: String,
    image: {
        url: String,
        publicId: String,
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
        default: "text"
    },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

export const Messages = mongoose.model<IMessage>("Messages", messageSchema);