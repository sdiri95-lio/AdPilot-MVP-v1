import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIGateway {
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-2.0-flash";

    console.log(`[AI Gateway] Attempting generation with model ${modelName} for feature ${feature} (user: ${userId})...`);

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${userPrompt}\n\nIMPORTANT: You MUST respond with a raw JSON object that strictly matches the expected JSON structure. Do not wrap the JSON in code blocks, markdown formatting, or explain anything else.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response content from Gemini");
      }

      const cleanContent = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsedJson = JSON.parse(cleanContent);

      const validated = schema.safeParse(parsedJson);
      if (!validated.success) {
        console.error(`[AI Gateway] Zod validation failed for model ${modelName}:`, validated.error);
        throw new Error(`JSON schema validation failed: ${validated.error.message}`);
      }

      return validated.data;
    } catch (err: unknown) {
      console.error(`[AI Gateway] Generation failed:`, err);
      throw err;
    }
  }
}
