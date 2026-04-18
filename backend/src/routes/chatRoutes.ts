import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getChats } from "../controllers/chatController";
import { getOrCreateChat } from "../controllers/chatController";

const router = Router();

router.use(protectRoute);
router.get("/", getChats);
router.post("/with/:participantId", getOrCreateChat);

export default router;