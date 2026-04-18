import type { Request, Response, NextFunction } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import User from "../Models/User";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protectRoute = [
  requireAuth(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId: clerkId } = getAuth(req);
      //since we called requireAuth(), clerkId will always be defined if the user is authenticated
      // if (!clerkId) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }
      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.userId = user._id.toString();
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500);
      next(error);
    }
  },
];
