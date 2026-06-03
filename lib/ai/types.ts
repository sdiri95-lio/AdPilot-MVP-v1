export interface AIProviderResponse {
  content: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  responseFormat?: "json_object" | "text";
}

export interface AIProvider {
  generate(config: AIProviderConfig): Promise<AIProviderResponse>;
}
