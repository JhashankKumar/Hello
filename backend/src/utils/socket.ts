import { Server, Socket, Socket as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import User from "../Models/User";
import Chat from "../Models/Chat";
import Message from "../Models/Message";

// map of online users - userId -> socket.id
const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://localhost:5173", // react app
    "http://localhost:8081", // expo mobile app
    process.env.FRONTEND_URL as string, // production frontend url
  ];
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // verify the socket connection - if the user is authenticated, we will store the user id in the socket.io instance
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // this is what user will send from the client
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkId = session.sub;
      const user = await User.findOne({ clerkId });
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.data.userId = user._id.toString();
      next();
    } catch (error) {
      return next(new Error(error as string));
    }
  });

  // this "connection" event named is predefined by socket.io
  // it's the event that is triggered when a new client connects to the server
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    // send list of currently online users to the newly connected client
    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId });

    socket.join(`user:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    //handle sending messages
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string; media: string }) => {
        try {
          const { chatId, text, media } = data;
          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
          });
          if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
          }
          const message = await Message.create({
            chat: chat._id,
            sender: userId,
            text,
            media,
          });
          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();
          await chat.save();

          await message.populate("sender", "name email avatar");

          // emit to the chat room( for all users in the chat)
          io.to(`chat:${chatId}`).emit("new-message", { message });

          // also emit to participants personal rooms (for chat list view)
          for (const participantId of chat.participants) {
            if (participantId.toString() !== userId) {
              io.to(`user:${participantId}`).emit("new-message", { message });
            }
          }
        } catch (error) {
          socket.emit("error", {
            message: (error as string) || "Failed to send message",
          });
        }
      },
    );

    // handle typing status
    // TO DO Later - need to implement the logic to track typing status
    socket.on("typing", async (data: { chatId: string }) => {
      const { chatId } = data;
      io.to(`chat:${chatId}`).emit("typing", { userId });
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      onlineUsers.delete(userId);
      // notify others that this current user is offline
      socket.broadcast.emit("user-offline", { userId });
    });
  });
  return io;
};
