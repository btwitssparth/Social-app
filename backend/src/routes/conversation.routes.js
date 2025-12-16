// backend/src/routes/conversation.routes.js
import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.js";
import { 
  getUserConversations, 
  getOrCreateConversation // Import the new function
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(verifyJwt); // Apply verifyJwt to all routes

router.get("/", getUserConversations);
router.post("/", getOrCreateConversation); // <--- Add this new route

export default router;