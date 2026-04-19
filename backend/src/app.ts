import express from "express";
import path from "path";
import userRoutes from "./routes/userRoutes";
import messageRoutes from "./routes/messageRoutes";
import chatRoutes from "./routes/chatRoutes";
import authRoutes from "./routes/authRoutes";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json()); // parses incoming requests with JSON payloads
app.use(clerkMiddleware()); // middleware to authenticate requests

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is up and running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/chats", chatRoutes);

/* error handler must come after all the routes and other middlewares so they can catch any errors passed with next(error)
or throw inside async handlers */
app.use(errorHandler);

// serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../web/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../web/dist", "index.html"));
    });
}

export default app;