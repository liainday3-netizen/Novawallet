
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizQuestion, QuantificationReport } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to handle common errors including 404
const handleAIError = (e: any) => {
  console.error("Gemini API Error:", e);
  if (e?.message?.includes("Requested entity was not found") || e?.status === "NOT_FOUND") {
    // This often means the model is not available for the current key/region
    // or the key needs to be re-selected.
    throw new Error("Model not found. You may need to select a paid API key or check model availability.");
  }
  throw e;
};

// FAST: Market Quiz & Daily Content
export const getMarketQuiz = async (): Promise<QuizQuestion> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: "Generate a complex multiple-choice question about TON blockchain or advanced finance. JSON format only.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return handleAIError(e);
  }
};

// FAST: Positive Quotes
export const getDailyInspiration = async (): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: "Generate a short, addictive, high-energy positive financial quote or funny crypto tip for a home screen widget. No quotes symbols."
    });
    return response.text || "To the moon! 🚀";
  } catch (e) {
    return handleAIError(e);
  }
};

// SEARCH: Trading Advice
export const getTradingAdvice = async (marketState: string): Promise<{text: string, sources: any[]}> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Acting as NovaBot Pro, search for current trends and provide 1 tip for: ${marketState}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return {
      text: response.text || "Analyze trends carefully.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    return handleAIError(e);
  }
};

// MAPS: Local Financial Information
export const getNearbyBanksOrATMs = async (lat: number, lng: number): Promise<{text: string, sources: any[]}> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest",
      contents: "Where are the closest highly-rated ATMs or banks specializing in international transfers around my location?",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      }
    });
    return {
      text: response.text || "Checking maps...",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    return handleAIError(e);
  }
};

// THINKING: Deep Analysis
export const getComplexThinking = async (query: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: query,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text || "Deep thinking failed.";
  } catch (e) {
    return handleAIError(e);
  }
};

// MULTIMODAL: Transcribe Audio
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: "Transcribe the following audio precisely." },
        { inlineData: { data: base64Audio, mimeType: "audio/webm" } }
      ]
    });
    return response.text || "Transcription failed.";
  } catch (e) {
    return handleAIError(e);
  }
};

// MULTIMODAL: Analyze Image/Video
export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ]
    });
    return response.text || "Analysis failed.";
  } catch (e) {
    return handleAIError(e);
  }
};

// IMAGE GEN: Gemini 3 Pro Image
export const generateImage = async (prompt: string, aspectRatio: string, imageSize: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return "";
  } catch (e) {
    return handleAIError(e);
  }
};

// IMAGE EDIT: Gemini 2.5 Flash Image
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/png" } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return "";
  } catch (e) {
    return handleAIError(e);
  }
};

// VIDEO GEN: Veo 3.1
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  try {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    return handleAIError(e);
  }
};

export const getQuantificationReport = async (summary: string): Promise<QuantificationReport> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a financial quantification report for this portfolio: ${summary}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            efficiencyScore: { type: Type.INTEGER },
            riskLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Extreme"] },
            diversificationIndex: { type: Type.INTEGER },
            aiAdvice: { type: Type.STRING },
            growthPotential: { type: Type.INTEGER }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return handleAIError(e);
  }
};

export const getLiveMarketNews = async () => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "3 trending TON blockchain news snippets.",
      config: { tools: [{ googleSearch: {} }] }
    });
    return {
      text: response.text || "",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    return handleAIError(e);
  }
};

export const getDeepMarketAnalysis = async (q: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: q,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text || "";
  } catch (e) {
    return handleAIError(e);
  }
};

// Added missing getCommunityTrends function to resolve error in CommunityScreen.tsx
/**
 * Fetches trending topics or short news snippets for the TON blockchain community.
 */
export const getCommunityTrends = async (): Promise<string[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 5 trending topics or short news snippets for the TON blockchain community. Focus on DeFi, mining, and ecosystem growth. JSON format only.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    try {
      return handleAIError(e);
    } catch (innerE) {
      return [
        "TON ecosystem reaches new transaction peak.",
        "New DeFi liquidity protocols launching on TON.",
        "Mining difficulty adjustment expected next week.",
        "Global adoption of TON payments in retail.",
        "Community governance vote for next major upgrade."
      ];
    }
  }
};
