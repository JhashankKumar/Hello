import mongoose, { Schema, type Document } from "mongoose";

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  media?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    media: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

//index for chat and sender for faster retrieval of messages
MessageSchema.index({ chat: 1, createdAt: 1 }); // oldest message first
// 1 means ascending order
// -1 means descending order

const Message = mongoose.model("Message", MessageSchema);

export default Message;
