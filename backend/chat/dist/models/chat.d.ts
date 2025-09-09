import mongoose, { Document } from "mongoose";
/**
 * IChat Interface
 * ----------------
 * - Defines the TypeScript type for a Chat document in MongoDB.
 * - Extends Mongoose's Document type for full type safety.
 */
export interface IChat extends Document {
    user: string[];
    latestmessage: {
        text: string;
        sender: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Chat Model
 * -----------
 * - Mongoose model representing the "Chat" collection.
 * - Allows querying, creating, updating chat documents.
 */
export declare const Chat: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, {}> & IChat & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Chat.d.ts.map