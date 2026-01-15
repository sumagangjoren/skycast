import { GoogleGenAI } from "@google/genai";

export const getWeatherInsights = async (weather, location) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      Provide a concise, friendly weather summary for ${location.name}.
      Current Temp: ${weather.current.temp}°
      Condition: ${weather.current.condition}
      Humidity: ${weather.current.humidity}%
      UV Index: ${weather.current.uvIndex}
      
      Suggest appropriate clothing and outdoor activities for today. Keep it under 60 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and witty weather assistant named SkyCast AI.",
        temperature: 0.7,
      },
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("AI Insight error:", error);
    return "SkyCast AI is currently resting. Check back soon for insights!";
  }
};