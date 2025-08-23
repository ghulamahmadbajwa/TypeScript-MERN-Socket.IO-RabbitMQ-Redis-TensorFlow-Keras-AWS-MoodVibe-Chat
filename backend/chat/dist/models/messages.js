import mongoose, { Document, Schema, Types } from "mongoose";
const messageSchema = new Schema({
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
export const Messages = mongoose.model("Messages", messageSchema);
//# sourceMappingURL=messages.js.map