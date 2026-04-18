import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import Chat from "../Models/Chat";
import { Types } from "mongoose";

export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    //format the chats to include the other participant except the current user
    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (participant) => participant._id.toString() !== userId,
      );
      return {
        _id: chat._id,
        participant: otherParticipant ?? null,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      };
    });
    res.status(200).json(formattedChats);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getOrCreateChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { participantId } = req.params;

    if (!participantId) {
      res.status(400);
      next(new Error("Participant ID is required"));
      return;
    }

    const participantIdObjectId =
      typeof participantId === "string"
        ? participantId
        : (participantId[0] ?? undefined);

    if (
      !participantIdObjectId ||
      !Types.ObjectId.isValid(participantIdObjectId)
    ) {
      res.status(400);
      next(new Error("Invalid participant ID"));
      return;
    }

    if (userId === participantId) {
      res.status(400);
      next(new Error("You cannot chat with yourself"));
      return;
    }

    //check if the chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");
    if (!chat) {
      const newChat = new Chat({
        participants: [userId, participantId],
      });
      await newChat.save();
      chat = await newChat.populate("participants", "name email avatar");
    }

    const otherParticipant = chat.participants.find(
      (participant) => participant._id.toString() !== userId,
    );
    res.status(200).json({
      _id: chat._id,
      participant: otherParticipant ?? null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
}
