import { GoogleGenAI } from "@google/genai";

export const getFinancialInsights = async (
  stats: any,
  transactions: any,
  goals: any
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "API Key is missing. Please set the API_KEY environment variable to use AI features.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze the following financial dashboard data and provide a concise (max 3 sentences) helpful insight or tip for the user, ${"Adaline"}.
      
      Stats: ${JSON.stringify(stats)}
      Recent Transactions: ${JSON.stringify(transactions)}
      Goals: ${JSON.stringify(goals)}
      
      Tone: Professional but friendly. Focus on saving opportunities or praising progress.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "AI service is temporarily unavailable.";
  }
};