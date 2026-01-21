import { GoogleGenAI, Modality } from "@google/genai";
import { NewsStory, NewsSource } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Fetches and simplifies news for kids using Gemini with Google Search Grounding.
 */
export const fetchKidsNews = async (topic: string = "general"): Promise<NewsStory[]> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      You are a cheerful news anchor for children aged 8-12. 
      Find 3 of the most interesting, positive, or important recent news stories related to "${topic}".
      
      Requirements:
      1. Use specific details from real recent events (last 48 hours preferred).
      2. Rewrite them to be easy to understand, avoiding scary language.
      3. Assign a relevant emoji to each story.
      4. Include a "funFact" related to the topic if possible.
      
      Output Format:
      Return ONLY a raw JSON array inside a markdown code block. Do not add conversational text outside the block.
      Structure:
      [
        {
          "headline": "Short Catchy Title",
          "summary": "2-3 simple sentences explaining what happened.",
          "emoji": "🚀",
          "category": "Science/World/Animals/Sports",
          "funFact": "Did you know..."
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    // Extract grounding sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let sources: NewsSource[] = [];
    if (groundingChunks) {
      sources = groundingChunks
        .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));
    }

    const text = response.text || '';
    
    // Parse JSON from Markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    let parsedStories: NewsStory[] = [];

    if (jsonMatch && jsonMatch[1]) {
      parsedStories = JSON.parse(jsonMatch[1]);
    } else {
      // Fallback if no code block found (rare with this prompt)
      try {
        parsedStories = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON directly", e);
        throw new Error("Could not understand the news.");
      }
    }

    // Attach sources to the stories (distribute them or attach to all for simplicity in this UI)
    // For this app, we will attach unique sources to the first story or distribute generic ones
    return parsedStories.map(story => ({
      ...story,
      sources: sources.slice(0, 3) // Give up to 3 sources per story context
    }));

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Converts text to speech using Gemini TTS
 */
export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is usually friendly/energetic
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received");
    }

    // Decode audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const playAudioBuffer = (buffer: AudioBuffer): AudioBufferSourceNode => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
  return source;
};