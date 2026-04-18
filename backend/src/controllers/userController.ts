import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import User from "../Models/User";

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        //find all users except the current user and limit the results to 50
        const users = await User.find({ _id: { $ne: userId } }).select("name email avatar").limit(50);
        res.status(200).json(users);
    } catch (error) {
        res.status(500);
        next(error);
    }
}