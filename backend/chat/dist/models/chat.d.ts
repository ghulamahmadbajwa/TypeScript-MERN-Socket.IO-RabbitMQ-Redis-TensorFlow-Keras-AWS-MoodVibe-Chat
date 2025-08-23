import mongoose, { Document } from "mongoose";
export interface IChat extends Document {
    user: string[];
    latestmessage: {
        text: string;
        sender: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Chat: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, {}> & IChat & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Chat.d.ts.map