import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const generateCaption = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new ApiError(400, "Prompt is required");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(500, "Gemini API key missing");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.0-pro",
  });

  const result = await model.generateContent(
    `Generate 5 short, catchy social media captions for: ${prompt}`
  );

  const text = result.response.text();

  if (!text) {
    throw new ApiError(500, "AI generation failed");
  }

  const captions = text
    .split("\n")
    .map((c) => c.replace(/^\d+[\).\s-]*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);

  return res.status(200).json(
    new ApiResponse(200, captions, "Captions generated successfully")
  );
});
