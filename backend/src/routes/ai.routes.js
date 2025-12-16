import { Router } from "express";
import { generateCaption } from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/Auth.js"

const router = Router();

router.post("/caption", verifyJwt, generateCaption);

export default router;
