export interface AIProviderRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProviderResponse {
  text: string;
}

export interface AIProvider {
  sendRequest(request: AIProviderRequest, options?: { timeoutMs?: number }): Promise<AIProviderResponse>;
}

export class OpenRouterAIProvider implements AIProvider {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }
    this.apiKey = apiKey;
    this.endpoint = "https://openrouter.ai/api/v1/chat/completions";
  }

  async sendRequest(
    request: AIProviderRequest,
    options?: { timeoutMs?: number }
  ): Promise<AIProviderResponse> {
    const timeout = options?.timeoutMs ?? 30000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://adpilot.africa",
          "X-Title": "AdPilot Africa",
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: request.temperature ?? 0.1,
          max_tokens: request.maxTokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response content from OpenRouter");
      }

      return { text: content };
    } catch (err: unknown) {
      clearTimeout(id);
      throw err;
    }
  }
}
