// FIX: Updated the import to use the correct '@google/genai' package instead of the deprecated '@google/ai'.
import { GoogleGenAI, Content, Part, Modality } from "@google/genai";
import { Message, MessageSender } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';

// Helper to remove the base64 prefix
const base64ToGenaipart = (data: string, mimeType: string): Part => {
    return {
        inlineData: {
            data: data.substring(data.indexOf(',') + 1),
            mimeType
        }
    };
};

export async function getChatResponseStream(prompt: string, history: Message[], file?: { type: string; data: string; }) {
    
    const contents: Content[] = history.map(msg => {
        const parts: Part[] = [{ text: msg.text }];
        if (msg.file) {
            parts.push(base64ToGenaipart(msg.file.data, msg.file.type));
        }
        return {
            role: msg.sender === MessageSender.USER ? "user" : "model",
            parts: parts,
        };
    });

    const userParts: Part[] = [{ text: prompt }];
    if (file) {
        userParts.push(base64ToGenaipart(file.data, file.type));
    }

    contents.push({ role: "user", parts: userParts });

    const result = await ai.models.generateContentStream({
        model: textModel,
        contents: contents,
        config: {
            // FIX: Removed the first-response instruction as it is now handled by the frontend for better UX.
            systemInstruction: "You are a helpful and friendly AI assistant created by Abhishek.",
        },
    });

    return result;
}

export async function generateImage(prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        return null;
    }
}