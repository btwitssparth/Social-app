import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.js";
import { getMessages, sendMessage } from "../controllers/Message.controller.js";

const router = Router();

// send message (creates conversation if needed)
router.post("/send", verifyJwt, sendMessage);

// get messages of a conversation
router.get("/:conversationId", verifyJwt, getMessages);

export default router;
