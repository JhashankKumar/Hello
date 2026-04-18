import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getMessages } from "../controllers/messageController";

const router = Router();

router.use(protectRoute);
router.get("/chat/:chatId", getMessages);

export default router;