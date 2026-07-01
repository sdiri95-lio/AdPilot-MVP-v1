import { z } from "zod";

export class AIResponseParser {
  static parseJson<T extends z.ZodType>(text: string, schema: T): z.infer<T> {
    const cleanContent = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/, "")
      .trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanContent);
    } catch (err: unknown) {
      throw new Error(`Failed to parse AI response as JSON: ${err instanceof Error ? err.message : String(err)}`);
    }

    const validated = schema.safeParse(parsedJson);
    if (!validated.success) {
      throw new Error(`JSON schema validation failed: ${validated.error.message}`);
    }

    return validated.data;
  }
}
