import { Router } from "express";
import { getMe, authCallback } from "../controllers/authController";
import { protectRoute } from "../middleware/auth";

const router = Router();

// /api/v1/auth/me
router.get("/me", protectRoute, getMe);

// /api/v1/auth/callback
router.post("/callback", protectRoute, authCallback);

export default router;