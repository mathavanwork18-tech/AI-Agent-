import { storage } from '../models/storage.js';

export class GeminiService {
  private primaryModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

  public getApiKey(): string {
    const settings = storage.getSettings();
    return settings.geminiApiKey || process.env.GEMINI_API_KEY || '';
  }

  public isLiveApiAvailable(): boolean {
    const settings = storage.getSettings();
    return Boolean(this.getApiKey()) && !settings.demoMode;
  }

  /**
   * Generates content using Google Gemini API with automatic model fallback.
   */
  async generateContent(prompt: string, systemInstruction?: string): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return null;
    }

    for (const model of this.primaryModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Gemini API (${model}) error HTTP ${response.status}:`, errorText);
          continue; // Try next model in sequence
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0];
        if (candidate?.content?.parts) {
          const textParts = candidate.content.parts
            .filter((p: any) => p.text && !p.thought)
            .map((p: any) => p.text)
            .join('\n');

          if (textParts.trim()) {
            return textParts.trim();
          }
        }
      } catch (err: any) {
        console.warn(`Gemini API call to ${model} failed:`, err?.message || err);
        continue;
      }
    }

    return null;
  }

  /**
   * Generates JSON content from Gemini API with robust markdown stripping and parsing.
   */
  async generateJson<T>(prompt: string, systemInstruction?: string): Promise<T | null> {
    const raw = await this.generateContent(
      `${prompt}\n\nIMPORTANT: Respond ONLY with valid, raw JSON. Do not wrap in conversational preamble.`,
      systemInstruction
    );

    if (!raw) return null;

    try {
      // Clean markdown code blocks: ```json ... ``` or ``` ... ```
      let cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      
      // If there are leading/trailing characters around the outer JSON object or array
      const firstBracket = cleaned.indexOf('{');
      const firstSquare = cleaned.indexOf('[');
      if (firstBracket !== -1 && (firstSquare === -1 || firstBracket < firstSquare)) {
        const lastBracket = cleaned.lastIndexOf('}');
        if (lastBracket !== -1) {
          cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        }
      } else if (firstSquare !== -1) {
        const lastSquare = cleaned.lastIndexOf(']');
        if (lastSquare !== -1) {
          cleaned = cleaned.substring(firstSquare, lastSquare + 1);
        }
      }

      return JSON.parse(cleaned) as T;
    } catch (e) {
      console.warn('Failed to parse Gemini JSON output:', e);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
