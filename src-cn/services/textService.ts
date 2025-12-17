import { GoogleGenAI, Modality } from '@google/genai';
import { CONFIG } from '../config';
import { base64ToUint8Array } from '../utils/audioUtils';

export class TextService {
  private ai: GoogleGenAI;
  private chat: any;

  constructor() {
    const apiKey = CONFIG.getNextApiKey();
    this.ai = new GoogleGenAI({
      apiKey,
      baseUrl: CONFIG.API_BASE_URL
    });
    
    this.chat = this.ai.chats.create({
      model: CONFIG.MODELS.TEXT,
      config: {
        systemInstruction: CONFIG.SYSTEM_INSTRUCTION,
      }
    });
  }

  async sendMessage(text: string): Promise<{ text: string; audioData: Uint8Array | null }> {
    const result = await this.chat.sendMessage({ message: text });
    const responseText = result.text || "网络不给力哦~";

    // 生成TTS
    let audioData: Uint8Array | null = null;
    try {
      const ttsResponse = await this.ai.models.generateContent({
        model: CONFIG.MODELS.TTS,
        contents: { parts: [{ text: responseText }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: CONFIG.SPEECH.VOICE_NAME } }
          }
        }
      });

      const ttsBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (ttsBase64) audioData = base64ToUint8Array(ttsBase64);
    } catch (e) {
      console.warn("[TextService] TTS failed", e);
    }

    return { text: responseText, audioData };
  }
}
