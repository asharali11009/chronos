import { GoogleGenAI, Type } from "@google/genai";
import { QuoteData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyQuote = async (timeOfDay: string, weatherDesc: string): Promise<QuoteData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate a short, inspiring motivational quote for someone. 
    Context: It is currently ${timeOfDay} and the weather is ${weatherDesc}. 
    Keep it under 30 words. Be unique.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            author: { type: Type.STRING, description: "A generated name or 'Unknown'" }
          },
          required: ["text", "author"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      text: result.text || "Time creates all things.",
      author: result.author || "Chronos"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi"
    };
  }
};