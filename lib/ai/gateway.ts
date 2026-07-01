import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { OpenRouterProvider } from "./openrouter";
import { AIProviderConfig } from "./types";

export type AIFeature =
  | "product-analyzer"
  | "opportunity-score"
  | "test-strategy"
  | "copy-generator"
  | "profit-calculator"
  | "test-decision"
  | "import-explanation";

interface AIModels {
  primary: string;
  fallback: string;
}

const featureModels: Record<AIFeature, AIModels> = {
  "product-analyzer": {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "google/gemini-2.5-flash",
  },
  "opportunity-score": {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "openai/gpt-4o-mini",
  },
  "test-strategy": {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "google/gemini-2.5-flash",
  },
  "copy-generator": {
    primary: "openai/gpt-4o-mini",
    fallback: "google/gemini-2.5-flash",
  },
  "profit-calculator": {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "google/gemini-2.5-flash",
  },
  "test-decision": {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "google/gemini-2.5-flash",
  },
  "import-explanation": {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "google/gemini-2.5-flash",
  },
};

export class AIGateway {
  private provider: OpenRouterProvider;

  constructor() {
    this.provider = new OpenRouterProvider();
  }

  private async logUsage(
    userId: string,
    feature: string,
    model: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  ) {
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId,
          feature,
          model,
          tokensInput: usage.promptTokens,
          tokensOutput: usage.completionTokens,
          totalTokens: usage.totalTokens,
        },
      });

      await prisma.usage.update({
        where: { userId },
        data: {
          aiCallsUsed: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("Failed to log AI usage:", error);
    }
  }

  async generate<T extends z.ZodTypeAny>(params: {
    userId: string;
    feature: AIFeature;
    systemPrompt: string;
    userPrompt: string;
    schema: T;
  }): Promise<z.infer<T>> {
    const models = featureModels[params.feature];
    let attempts = 0;
    const maxRetries = 1; // Retry once if validation fails
    
    const config: AIProviderConfig = {
      model: models.primary,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      responseFormat: "json_object",
    };

    while (attempts <= maxRetries) {
      try {
        const response = await this.provider.generate(config);
        
        if (!response.content) {
          throw new Error("Empty response from AI provider.");
        }

        const parsedJson = JSON.parse(response.content);
        const validatedData = params.schema.parse(parsedJson);

        // Success, log usage
        await this.logUsage(params.userId, params.feature, config.model, response.usage);

        return validatedData;
      } catch (error) {
        console.error(`AI Generation attempt ${attempts + 1} failed for ${params.feature}:`, error);
        attempts++;
        
        if (attempts > maxRetries && config.model === models.primary) {
          console.warn(`Falling back to ${models.fallback} for ${params.feature}...`);
          config.model = models.fallback;
          attempts = 0; // reset attempts for the fallback model
        } else if (attempts > maxRetries) {
          throw new Error(`AI generation failed after retries and fallback for ${params.feature}.`);
        }
      }
    }

    throw new Error("Unexpected end of AI generation loop.");
  }
}
