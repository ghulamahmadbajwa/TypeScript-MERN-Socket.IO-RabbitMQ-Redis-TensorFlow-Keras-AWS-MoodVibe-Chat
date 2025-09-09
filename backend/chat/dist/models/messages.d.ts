import mongoose, { Document, Types } from "mongoose";
/**
 * IMessage Interface
 * -----------------
 * Defines the structure of a message document in MongoDB.
 */
export interface IMessage extends Document {
    chatId: Types.ObjectId;
    sender: string;
    text?: string;
    image?: {
        url: string;
        publicId: string;
    };
    messageType: "text" | "image";
    seen: boolean;
    seenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Messages Model
 * --------------
 * Mongoose model representing the "Messages" collection.
 * - Allows creating, reading, updating, and querying message documents.
 */
export declare const Messages: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=messages.d.ts.map