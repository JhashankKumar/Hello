import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import Message from "../Models/Message";
import Chat from "../Models/Chat";

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const chatId = req.params.chatId;
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
        });
        if (!chat) {
            res.status(404);
            next(new Error("Chat not found"));
            return;
        }
        // order by createdAt in ascending order
        const messages = await Message.find({ chat: chat._id })
        .populate("sender", "name email avatar")
        .sort({ createdAt: 1 })
        res.status(200).json(messages);
    } catch (error) {
        res.status(500);
        next(error);
    }
}