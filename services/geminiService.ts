import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from '../constants';

export class GeminiService {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.model = GEMINI_MODEL;
  }

  async getExplanation(term: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: `Explain the legal property term "${term}" in simple, easy-to-understand English for a home buyer. Keep it under 50 words.`,
      });
      return response.text || "I couldn't generate an explanation at this time.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Service currently unavailable.";
    }
  }

  async chat(history: { role: string, text: string }[], message: string): Promise<string> {
    try {
      const chat = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction: "You are TitleBot, a helpful assistant for a property document ordering platform called TitleFlow. You help users understand title searches, deposited plans, and dealings. You do NOT give legal advice, but you explain terms clearly. Keep responses concise.",
        },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
      });

      const response = await chat.sendMessage({ message });
      return response.text || "";
    } catch (error) {
      console.error("Chat Error:", error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  }
}

export const geminiService = new GeminiService();
