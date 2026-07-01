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

export const getMaxTokens = (): number => {
  const envTokens = process.env.AI_MAX_TOKENS;
  let tokens = 2500;
  if (envTokens) {
    const parsed = parseInt(envTokens, 10);
    if (!isNaN(parsed)) {
      tokens = parsed;
    }
  }
  // Clamp between 256 and 4000
  return Math.max(256, Math.min(4000, tokens));
};
