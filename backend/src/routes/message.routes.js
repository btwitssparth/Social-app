
import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.js";
import { 
  getMessages, 
  sendMessage, 
  getUnreadCount,   // <--- Import
  markMessagesAsRead // <--- Import
} from "../controllers/Message.controller.js";

const router = Router();

router.post("/send", verifyJwt, sendMessage);
router.get("/unread", verifyJwt, getUnreadCount); // <--- New Route
router.get("/:conversationId", verifyJwt, getMessages);
router.post("/read/:conversationId", verifyJwt, markMessagesAsRead); // <--- New Route

export default router;