import { Router } from "express";
import { getMe, authCallback } from "../controllers/authController";
import { protectRoute } from "../middleware/auth";

const router = Router();

// /api/v1/auth/me
router.use(protectRoute);
router.get("/me", getMe);

// /api/v1/auth/callback
router.post("/callback", authCallback);

export default router;