import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  user: string[];
  latestmessage: {
    text: string;
    sender: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SchemaChat = new Schema<IChat>(
  {
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
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", SchemaChat);
