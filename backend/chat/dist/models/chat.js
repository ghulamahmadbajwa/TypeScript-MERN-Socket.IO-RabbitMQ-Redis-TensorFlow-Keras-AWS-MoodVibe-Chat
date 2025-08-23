import mongoose, { Document, Schema } from "mongoose";
const SchemaChat = new Schema({
    user: [
        {
            type: String,
            required: true,
        },
    ],
    latestmessage: {
        text: {
            type: String,
        },
        sender: {
            type: String,
        },
    },
}, { timestamps: true });
export const Chat = mongoose.model("Chat", SchemaChat);
//# sourceMappingURL=Chat.js.map