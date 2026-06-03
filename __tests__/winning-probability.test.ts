/**
 * Sprint 3B.5 — Winning Probability Hardening Tests
 * 
 * Tests cover:
 *  1. Zod schema validation (valid, invalid ranges, missing fields)
 *  2. AIGateway integration for "opportunity-score" (valid flow)
 *  3. Retry path (gateway recovers from invalid JSON)
 *  4. Fallback/Exhaustion (gateway throws after retries exhausted)
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import { ZodError } from "zod";
import { opportunityScoreAiSchema } from "@/lib/ai/schemas";
import { AIGateway } from "@/lib/ai/gateway";
import { OpenRouterProvider } from "@/lib/ai/openrouter";

// ── Mock OpenRouter ────────────────────────────────────────────────────────
const mockProviderGenerate = vi.fn();
vi.mock("@/lib/ai/openrouter", () => ({
  OpenRouterProvider: vi.fn().mockImplementation(class {
    generate = mockProviderGenerate;
  }),
}));

// ── Shared Fixtures ────────────────────────────────────────────────────────
const MOCK_VALID_AI_RESULT = {
  winningProbability: 85,
  confidenceScore: 90,
  reasoning: [
    "High product score indicates strong market fit.",
    "Low risk score means fewer potential hurdles."
  ],
  recommendation: "TEST"
};

describe("opportunityScoreAiSchema", () => {
  it("should validate a complete, valid AI response", () => {
    const result = opportunityScoreAiSchema.safeParse(MOCK_VALID_AI_RESULT);
    expect(result.success).toBe(true);
  });

  it("should reject winningProbability greater than 100", () => {
    const invalid = { ...MOCK_VALID_AI_RESULT, winningProbability: 105 };
    const result = opportunityScoreAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject confidenceScore less than 0", () => {
    const invalid = { ...MOCK_VALID_AI_RESULT, confidenceScore: -5 };
    const result = opportunityScoreAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject floating point numbers for scores", () => {
    const invalid = { ...MOCK_VALID_AI_RESULT, winningProbability: 85.5 };
    const result = opportunityScoreAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject reasoning array with less than 2 items", () => {
    const invalid = { ...MOCK_VALID_AI_RESULT, reasoning: ["Only one reason"] };
    const result = opportunityScoreAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject missing reasoning field", () => {
    const invalid = { winningProbability: 85, confidenceScore: 90 };
    const result = opportunityScoreAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// Mock Prisma for AIUsageLog
vi.mock("@/lib/prisma", () => ({
  prisma: {
    aIUsageLog: {
      create: vi.fn(),
    },
    usage: {
      update: vi.fn(),
    },
  },
}));

describe("AIGateway - opportunity-score integration", () => {
  let gateway: AIGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new AIGateway();
  });

  it("should parse and return valid opportunity-score JSON", async () => {
    mockProviderGenerate.mockResolvedValueOnce({
      content: JSON.stringify(MOCK_VALID_AI_RESULT),
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    });

    const result = await gateway.generate({
      userId: "test-user",
      feature: "opportunity-score",
      systemPrompt: "System",
      userPrompt: "User",
      schema: opportunityScoreAiSchema,
    });

    expect(result).toMatchObject(MOCK_VALID_AI_RESULT);
    expect(mockProviderGenerate).toHaveBeenCalledTimes(1);
  });

  it("should retry if OpenRouter returns invalid JSON structure", async () => {
    // First attempt: missing 'reasoning'
    mockProviderGenerate.mockResolvedValueOnce({
      content: JSON.stringify({ winningProbability: 80, confidenceScore: 90 }),
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    });
    // Second attempt: valid
    mockProviderGenerate.mockResolvedValueOnce({
      content: JSON.stringify(MOCK_VALID_AI_RESULT),
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    });

    const result = await gateway.generate({
      userId: "test-user",
      feature: "opportunity-score",
      systemPrompt: "System",
      userPrompt: "User",
      schema: opportunityScoreAiSchema,
    });

    expect(result).toMatchObject(MOCK_VALID_AI_RESULT);
    expect(mockProviderGenerate).toHaveBeenCalledTimes(2);
  });

  it("should throw after exhausting retries and fallback", async () => {
    // Both primary (2 attempts) and fallback (2 attempts) fail
    mockProviderGenerate.mockResolvedValue({
      content: "invalid json string",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    });

    await expect(
      gateway.generate({
        userId: "test-user",
        feature: "opportunity-score",
        systemPrompt: "System",
        userPrompt: "User",
        schema: opportunityScoreAiSchema,
      })
    ).rejects.toThrow(/AI generation failed after retries and fallback/);

    // Primary attempt 1, Primary attempt 2, Fallback attempt 1, Fallback attempt 2
    expect(mockProviderGenerate).toHaveBeenCalledTimes(4);
  });
});
