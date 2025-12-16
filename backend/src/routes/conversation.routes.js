import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.js";
import {
  getUserConversations,
} from "../controllers/conversation.controller.js";

const router = Router();

// get all conversations of logged-in user
router.get("/", verifyJwt, getUserConversations);

export default router;
