import { z } from "zod";
import { AIClient } from "./client";

export class AIGateway {
  private client: AIClient;

  constructor() {
    this.client = new AIClient();
  }

  async generate<T extends z.ZodType>({
    userId,
    feature,
    systemPrompt,
    userPrompt,
    schema,
  }: {
    userId: string;
    feature: string;
    systemPrompt: string;
    userPrompt: string;
    schema: T;
  }): Promise<z.infer<T>> {
    console.log(`[AIGateway Facade] Routing feature: ${feature} for user: ${userId}`);
    return this.client.generate(systemPrompt, userPrompt, schema);
  }
}
