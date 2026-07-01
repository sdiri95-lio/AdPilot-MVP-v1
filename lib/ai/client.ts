import { z } from "zod";
import { AIProvider, OpenRouterAIProvider } from "./provider";
import { AIResponseParser } from "./parser";
import { AIPromptBuilder } from "./builder";
import { getActiveModel, FALLBACK_MODEL } from "./config";

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export class AIClient {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider ?? new OpenRouterAIProvider();
  }

  async generate<T extends z.ZodType>(
    systemPrompt: string,
    userPrompt: string,
    schema: T,
    options?: AIGenerateOptions
  ): Promise<z.infer<T>> {
    const configuredModel = options?.model ?? getActiveModel();
    const temperature = options?.temperature ?? 0.1;
    const maxRetries = options?.maxRetries ?? 3;
    const timeoutMs = options?.timeoutMs ?? 30000;

    const preparedUserPrompt = AIPromptBuilder.buildUserPrompt(userPrompt);

    try {
      return await this.executeAttempt(
        configuredModel,
        systemPrompt,
        preparedUserPrompt,
        schema,
        temperature,
        maxRetries,
        timeoutMs
      );
    } catch (err: unknown) {
      if (configuredModel === FALLBACK_MODEL) {
        throw err;
      }
      console.warn(
        `[AI Client] Configured model ${configuredModel} failed. Automatically retrying once with fallback model ${FALLBACK_MODEL}...`
      );
      try {
        return await this.executeAttempt(
          FALLBACK_MODEL,
          systemPrompt,
          preparedUserPrompt,
          schema,
          temperature,
          1,
          timeoutMs
        );
      } catch (fallbackErr: unknown) {
        console.error(`[AI Client] Fallback model ${FALLBACK_MODEL} also failed:`, fallbackErr);
        throw fallbackErr;
      }
    }
  }

  private async executeAttempt<T extends z.ZodType>(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    schema: T,
    temperature: number,
    maxRetries: number,
    timeoutMs: number
  ): Promise<z.infer<T>> {
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(`[AI Client] Model ${model} execution attempt ${attempt}/${maxRetries}...`);
        const response = await this.provider.sendRequest(
          {
            model,
            systemPrompt,
            userPrompt,
            temperature,
          },
          { timeoutMs }
        );

        return AIResponseParser.parseJson(response.text, schema);
      } catch (err: unknown) {
        console.warn(`[AI Client] Model ${model} attempt ${attempt} failed:`, err);
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 500));
        }
      }
    }

    throw lastError || new Error(`Execution failed for model ${model}`);
  }
}
