import { z } from "zod";

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
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    // Claude 3.5 Sonnet as primary, Gemini 2.5 Flash as fallback
    const models = [
      "anthropic/claude-3.5-sonnet",
      "google/gemini-2.5-flash",
    ];

    let lastError: unknown = null;

    for (const model of models) {
      try {
        console.log(`[AI Gateway] Attempting generation with model ${model} for feature ${feature} (user: ${userId})...`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://adpilot.africa",
            "X-Title": "AdPilot Africa",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `${userPrompt}\n\nIMPORTANT: You MUST respond with a raw JSON object that strictly matches the expected JSON structure. Do not wrap the JSON in code blocks, markdown formatting, or explain anything else.` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response content from OpenRouter");
        }

        const cleanContent = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        const parsedJson = JSON.parse(cleanContent);
        
        const validated = schema.safeParse(parsedJson);
        if (!validated.success) {
          console.error(`[AI Gateway] Zod validation failed for model ${model}:`, validated.error);
          throw new Error(`JSON schema validation failed: ${validated.error.message}`);
        }

        return validated.data;
      } catch (err: unknown) {
        console.warn(`[AI Gateway] Attempt with ${model} failed:`, err);
        lastError = err;
      }
    }

    throw new Error(`AI generation failed after trying all models: ${lastError instanceof Error ? lastError.message : "Unknown error"}`);
  }
}
