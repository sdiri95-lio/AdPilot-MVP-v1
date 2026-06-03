import { AIProvider, AIProviderConfig, AIProviderResponse } from "./types";

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error("OPENROUTER_API_KEY is not defined in environment.");
    }
    this.apiKey = key;
  }

  async generate(config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: config.systemPrompt },
          { role: "user", content: config.userPrompt }
        ],
        temperature: config.temperature ?? 0.7,
        response_format: config.responseFormat === "json_object" ? { type: "json_object" } : undefined,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || null,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      }
    };
  }
}
