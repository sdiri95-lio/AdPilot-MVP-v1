export const AI_MODELS = {
  GEMINI_FLASH: "google/gemini-2.5-flash",
  CLAUDE_SONNET: "anthropic/claude-sonnet-4",
  GPT_5: "openai/gpt-5",
  DEEPSEEK_CHAT: "deepseek/deepseek-chat",
  QWEN_235B: "qwen/qwen3-235b-a22b",
};

export const getActiveModel = (): string => {
  return process.env.AI_MODEL || AI_MODELS.GEMINI_FLASH;
};

export const FALLBACK_MODEL = AI_MODELS.GEMINI_FLASH;
