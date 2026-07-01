export class AIPromptBuilder {
  static buildUserPrompt(userPrompt: string): string {
    return `${userPrompt}\n\nIMPORTANT: You MUST respond with a raw JSON object that strictly matches the expected JSON structure. Do not wrap the JSON in code blocks, markdown formatting, or explain anything else.`;
  }
}
