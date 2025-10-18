
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In the target environment, process.env.API_KEY is expected to be set.
  console.warn("Gemini API key not found. Knowledge feature will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';
const systemInstruction = "You are a helpful and reassuring baby care assistant. Provide advice based on common knowledge and best practices for infant care. Always include a disclaimer that your advice is not a substitute for professional medical consultation. Your answers should be encouraging, clear, and easy to understand for new parents. Respond in the language of the user's query.";

export const getBabyCareAdvice = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "The AI Knowledge feature is currently unavailable. Please configure the API key.";
  }
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 1,
        topK: 32,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching advice from Gemini API:", error);
    return "Sorry, I encountered an error while trying to get advice. Please try again later.";
  }
};
