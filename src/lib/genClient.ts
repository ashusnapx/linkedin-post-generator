// src/lib/genClient.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_NAME } from "@/src/config/constants";
import { logger } from "./logger";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export function getModel() {
  try {
    return genAI.getGenerativeModel({ model: MODEL_NAME });
  } catch (err) {
    logger.error("Failed to get generative model", err);
    throw err;
  }
}
