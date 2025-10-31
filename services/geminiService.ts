
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In the target environment, process.env.API_KEY is expected to be set.
  console.warn("Gemini API key not found. Knowledge feature will be disabled.");
}

export type AiMode = 'standard' | 'quick' | 'deep' | 'web';

export interface WebResponse {
  text: string;
  sources: { web: { uri: string; title: string } }[];
}

const systemInstruction = "You are a helpful and reassuring baby care assistant. Provide advice based on common knowledge and best practices for infant care. Always include a disclaimer that your advice is not a substitute for professional medical consultation. Your answers should be encouraging, clear, and easy to understand for new parents. Respond in the language of the user's query.";

export const generateGeminiResponse = async (
  prompt: string,
  mode: AiMode,
): Promise<string | WebResponse | AsyncGenerator<GenerateContentResponse>> => {
  if (!API_KEY) {
    throw new Error("The AI Knowledge feature is currently unavailable. Please configure the API key.");
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    switch (mode) {
      case 'quick':
        return ai.models.generateContentStream({
          model: 'gemini-2.5-flash-lite',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

      case 'deep':
        const deepResponse = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingBudget: 32768 },
          }
        });
        return deepResponse.text;
      
      case 'web':
        const webResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction,
          },
        });
        const sources: { web: { uri: string; title: string } }[] = webResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text: webResponse.text, sources };

      case 'standard':
      default:
        const standardResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 1,
            topK: 32,
          }
        });
        return standardResponse.text;
    }
  } catch (error) {
    console.error(`Error fetching advice from Gemini API in ${mode} mode:`, error);
     if (error instanceof Error) {
        throw new Error(`Sorry, I encountered an error: ${error.message}. Please try again later.`);
    }
    throw new Error("Sorry, I encountered an unknown error. Please try again later.");
  }
};
