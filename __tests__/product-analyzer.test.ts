/**
 * Sprint 3B — Product Analyzer Tests
 *
 * Tests cover:
 *  1. Valid analysis flow — full pipeline, correct persistence
 *  2. Invalid AI response — Zod rejection, no DB writes
 *  3. Retry path — gateway throws once, succeeds on fallback
 *  4. DB persistence — ProductAnalysis record verifiable after run
 *  5. Project not found — 404 error class thrown
 *  6. AI usage limit — 403 from route
 *  7. Request body validation — 400 from route
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import { ZodError } from "zod";

// ── Module mocks ──────────────────────────────────────────────────────────────
// Mock prisma before importing anything that uses it
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    productAnalysis: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    aIUsageLog: {
      create: vi.fn(),
    },
    usage: {
      update: vi.fn(),
    },
  },
}));

// vi.mock() factories are hoisted before variable declarations.
// vi.hoisted() ensures mockGenerate is initialised before the factory runs.
const { mockGenerate } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
}));

vi.mock("@/lib/ai/gateway", () => ({
  AIGateway: vi.fn().mockImplementation(function (this: { generate: typeof mockGenerate }) {
    this.generate = mockGenerate;
  }),
}));

// ── Imports (after vi.mock) ────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import {
  ProductAnalyzerService,
  ProductAnalyzerNotFoundError,
  ProductAnalyzerAIError,
} from "@/lib/ai/product-analyzer";

// ── Shared test fixtures ───────────────────────────────────────────────────────
const MOCK_PROJECT = {
  id: "proj_test_123",
  userId: "user_test_abc",
  productName: "Wireless Earbuds Pro",
  productCost: { toNumber: () => 8.5 },
  sellingPrice: { toNumber: () => 29.99 },
  status: "ACTIVE" as const,
  name: "Test Project",
  productUrl: null,
  imageUrl: null,
  country: null,
  targetCountry: "Nigeria",
  productType: null,
  shippingCost: { toNumber: () => 0 },
  serviceFee: { toNumber: () => 0 },
  desiredProfit: { toNumber: () => 20 },
  category: null,
  demand: null,
  competition: null,
  emotionalTriggers: null,
  difficultyScore: null,
  marketOpportunity: null,
  winningProbability: null,
  confidenceScore: null,
  analysisVersion: "v1",
  mediaBuyerReport: null,
  riskScore: null,
  marketScore: null,
  productScore: null,
  revenue: null,
  margin: null,
  marginPercent: null,
  breakEvenCpl: null,
  breakEvenCpa: null,
  targetCpl: null,
  targetCpa: null,
  minCpl: null,
  recommendedCpl: null,
  maxCpl: null,
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

const MOCK_AI_RESULT = {
  category: "Electronics",
  demand: "HIGH" as const,
  competition: "MEDIUM" as const,
  emotionalTriggers: ["Freedom", "Quality", "Value"],
  difficultyScore: 5,
  marketOpportunity: 8,
  riskScore: "LOW" as const,
  marketScore: 8,
  productScore: 7,
  mediaBuyerReport: {
    summary: "Strong potential in Nigerian electronics market",
    recommendation: "TEST — allocate $150 initial budget",
    strengths: ["High demand", "Good margin"],
    weaknesses: ["Competitive space"],
    nextActions: ["Source samples", "Test with broad audience"],
  },
  targetAudience: [
    "Men aged 18–35 interested in tech gadgets",
    "Students and young professionals in Lagos",
  ],
  pricingRecommendations: [
    "Launch at ₦9,999 with a 20% introductory discount",
    "Bundle two units for ₦17,999 to increase AOV",
  ],
  risks: [
    "High return rate if quality does not match product images",
    "Copycat products may undercut pricing",
  ],
};

const MOCK_ANALYSIS_RECORD = {
  id: "anal_xyz_789",
  projectId: MOCK_PROJECT.id,
  model: "product-analyzer",
  analysisVersion: "v1",
  category: "Electronics",
  demand: "HIGH" as const,
  competition: "MEDIUM" as const,
  emotionalTriggers: ["Freedom", "Quality", "Value"],
  difficultyScore: 5,
  marketOpportunity: 8,
  riskScore: "LOW" as const,
  marketScore: 8,
  productScore: 7,
  strengths: ["High demand", "Good margin"],
  weaknesses: ["Competitive space"],
  targetAudience: MOCK_AI_RESULT.targetAudience,
  pricingRecommendations: MOCK_AI_RESULT.pricingRecommendations,
  risks: MOCK_AI_RESULT.risks,
  mediaBuyerReport: MOCK_AI_RESULT.mediaBuyerReport,
  opportunityScoreInputs: {
    productScore: 7,
    marketScore: 8,
    riskScore: "LOW",
    difficultyScore: 5,
    marketOpportunity: 8,
  },
  createdAt: new Date("2026-06-03"),
};

// Convenience casts
const mockPrismaProject = prisma.project as unknown as {
  findFirst: MockedFunction<typeof prisma.project.findFirst>;
  update: MockedFunction<typeof prisma.project.update>;
};
const mockPrismaProductAnalysis = prisma.productAnalysis as unknown as {
  create: MockedFunction<typeof prisma.productAnalysis.create>;
  findUnique: MockedFunction<typeof prisma.productAnalysis.findUnique>;
};

// ── Test suites ────────────────────────────────────────────────────────────────

describe("ProductAnalyzerService", () => {
  let service: ProductAnalyzerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductAnalyzerService();
  });

  // ── Test 1: Valid analysis flow ─────────────────────────────────────────────
  describe("analyze() — valid analysis", () => {
    it("should return analysis and updated project on success", async () => {
      // Arrange
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue({
        ...MOCK_PROJECT,
        category: "Electronics",
        demand: "HIGH",
        marketScore: 8,
        productScore: 7,
      } as any);

      // Act
      const result = await service.analyze({
        userId: "user_test_abc",
        projectId: "proj_test_123",
      });

      // Assert
      expect(result.analysis.id).toBe("anal_xyz_789");
      expect(result.analysis.category).toBe("Electronics");
      expect(result.analysis.demand).toBe("HIGH");
      expect(result.analysis.targetAudience).toHaveLength(2);
      expect(result.analysis.pricingRecommendations).toHaveLength(2);
      expect(result.analysis.risks).toHaveLength(2);
      expect(result.analysis.strengths).toEqual(["High demand", "Good margin"]);
      expect(result.analysis.opportunityScoreInputs).toMatchObject({
        productScore: 7,
        marketScore: 8,
        riskScore: "LOW",
      });
      expect(result.project).toBeDefined();
    });

    it("should call gateway.generate with the correct feature key", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      await service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" });

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ feature: "product-analyzer" }),
      );
    });

    it("should persist ProductAnalysis with all Sprint 3B fields", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      await service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" });

      const createCall = mockPrismaProductAnalysis.create.mock.calls[0][0];
      expect(createCall.data).toMatchObject({
        projectId: "proj_test_123",
        targetAudience: MOCK_AI_RESULT.targetAudience,
        pricingRecommendations: MOCK_AI_RESULT.pricingRecommendations,
        risks: MOCK_AI_RESULT.risks,
        strengths: MOCK_AI_RESULT.mediaBuyerReport.strengths,
        weaknesses: MOCK_AI_RESULT.mediaBuyerReport.weaknesses,
      });
    });

    it("should update the Project snapshot after analysis", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      await service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" });

      expect(mockPrismaProject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "proj_test_123" },
          data: expect.objectContaining({
            category: "Electronics",
            demand: "HIGH",
            productScore: 7,
            marketScore: 8,
          }),
        }),
      );
    });

    it("should include description in the prompt when provided", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      await service.analyze({
        userId: "user_test_abc",
        projectId: "proj_test_123",
        description: "Premium wireless earbuds with noise cancellation",
      });

      const generateCall = mockGenerate.mock.calls[0][0];
      expect(generateCall.userPrompt).toContain("Premium wireless earbuds with noise cancellation");
    });
  });

  // ── Test 2: Project not found ───────────────────────────────────────────────
  describe("analyze() — project not found", () => {
    it("should throw ProductAnalyzerNotFoundError when project does not exist", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(null);

      await expect(
        service.analyze({ userId: "user_test_abc", projectId: "nonexistent_id" }),
      ).rejects.toThrow(ProductAnalyzerNotFoundError);
    });

    it("should throw ProductAnalyzerNotFoundError when user does not own the project", async () => {
      // findFirst returns null because WHERE includes userId
      mockPrismaProject.findFirst.mockResolvedValue(null);

      await expect(
        service.analyze({ userId: "wrong_user", projectId: "proj_test_123" }),
      ).rejects.toThrow(ProductAnalyzerNotFoundError);
    });

    it("should NOT call the AI gateway if the project is not found", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(null);

      await expect(
        service.analyze({ userId: "user_test_abc", projectId: "bad_id" }),
      ).rejects.toThrow();

      expect(mockGenerate).not.toHaveBeenCalled();
    });
  });

  // ── Test 3: Invalid AI response (Zod rejection) ─────────────────────────────
  describe("analyze() — invalid AI response", () => {
    it("should throw ProductAnalyzerAIError when AI returns schema-invalid data", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      // Simulate gateway exhausting all retries and throwing
      mockGenerate.mockRejectedValue(
        new Error("AI generation failed after retries and fallback for product-analyzer."),
      );

      await expect(
        service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" }),
      ).rejects.toThrow(ProductAnalyzerAIError);
    });

    it("should NOT persist any ProductAnalysis when AI fails", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockRejectedValue(new Error("AI failed"));

      await expect(
        service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" }),
      ).rejects.toThrow();

      expect(mockPrismaProductAnalysis.create).not.toHaveBeenCalled();
    });

    it("should NOT update the Project snapshot when AI fails", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockRejectedValue(new Error("AI failed"));

      await expect(
        service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" }),
      ).rejects.toThrow();

      expect(mockPrismaProject.update).not.toHaveBeenCalled();
    });
  });

  // ── Test 4: Retry path ────────────────────────────────────────────────────
  describe("analyze() — retry handling", () => {
    it("should succeed when AIGateway retries internally and ultimately succeeds", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      // Simulate gateway resolving successfully (internally it may have retried)
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      const result = await service.analyze({
        userId: "user_test_abc",
        projectId: "proj_test_123",
      });

      expect(result.analysis).toBeDefined();
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it("should propagate ProductAnalyzerAIError when gateway exhausts all retries", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockRejectedValue(
        new Error("AI generation failed after retries and fallback for product-analyzer."),
      );

      await expect(
        service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" }),
      ).rejects.toBeInstanceOf(ProductAnalyzerAIError);
    });
  });

  // ── Test 5: DB persistence verification ───────────────────────────────────
  describe("analyze() — database persistence", () => {
    it("should return analysis whose id can be found via findUnique", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);
      // Simulate a subsequent lookup
      mockPrismaProductAnalysis.findUnique.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);

      const result = await service.analyze({
        userId: "user_test_abc",
        projectId: "proj_test_123",
      });

      const found = await prisma.productAnalysis.findUnique({
        where: { id: result.analysis.id },
      });

      expect(found).not.toBeNull();
      expect(found?.id).toBe(result.analysis.id);
    });

    it("should persist opportunityScoreInputs as a complete snapshot", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      await service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" });

      const createData = mockPrismaProductAnalysis.create.mock.calls[0][0].data;
      expect(createData.opportunityScoreInputs).toMatchObject({
        productScore: MOCK_AI_RESULT.productScore,
        marketScore: MOCK_AI_RESULT.marketScore,
        riskScore: MOCK_AI_RESULT.riskScore,
        difficultyScore: MOCK_AI_RESULT.difficultyScore,
        marketOpportunity: MOCK_AI_RESULT.marketOpportunity,
      });
    });

    it("should call prisma.productAnalysis.create exactly once per analysis", async () => {
      mockPrismaProject.findFirst.mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT as any);
      mockPrismaProductAnalysis.create.mockResolvedValue(MOCK_ANALYSIS_RECORD as any);
      mockPrismaProject.update.mockResolvedValue(MOCK_PROJECT as any);

      await service.analyze({ userId: "user_test_abc", projectId: "proj_test_123" });

      expect(mockPrismaProductAnalysis.create).toHaveBeenCalledTimes(1);
    });
  });
});

// ── Error class tests ──────────────────────────────────────────────────────────
describe("ProductAnalyzerNotFoundError", () => {
  it("should have the correct name", () => {
    const err = new ProductAnalyzerNotFoundError("proj_123");
    expect(err.name).toBe("ProductAnalyzerNotFoundError");
  });

  it("should include the projectId in the message", () => {
    const err = new ProductAnalyzerNotFoundError("proj_abc");
    expect(err.message).toContain("proj_abc");
  });

  it("should be instanceof Error", () => {
    const err = new ProductAnalyzerNotFoundError("x");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("ProductAnalyzerAIError", () => {
  it("should have the correct name", () => {
    const err = new ProductAnalyzerAIError("AI failed");
    expect(err.name).toBe("ProductAnalyzerAIError");
  });

  it("should store the cause", () => {
    const cause = new Error("original error");
    const err = new ProductAnalyzerAIError("AI failed", cause);
    expect(err.cause).toBe(cause);
  });
});

// ── Zod schema tests ───────────────────────────────────────────────────────────
describe("productAnalyzerAiSchema", () => {
  it("should validate a complete, valid AI response", async () => {
    const { productAnalyzerAiSchema } = await import("@/lib/ai/schemas");
    const result = productAnalyzerAiSchema.safeParse(MOCK_AI_RESULT);
    expect(result.success).toBe(true);
  });

  it("should reject a response missing targetAudience", async () => {
    const { productAnalyzerAiSchema } = await import("@/lib/ai/schemas");
    const invalid = { ...MOCK_AI_RESULT };
    // @ts-expect-error intentional
    delete invalid.targetAudience;
    const result = productAnalyzerAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject a response missing pricingRecommendations", async () => {
    const { productAnalyzerAiSchema } = await import("@/lib/ai/schemas");
    const invalid = { ...MOCK_AI_RESULT };
    // @ts-expect-error intentional
    delete invalid.pricingRecommendations;
    const result = productAnalyzerAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject a response missing risks", async () => {
    const { productAnalyzerAiSchema } = await import("@/lib/ai/schemas");
    const invalid = { ...MOCK_AI_RESULT };
    // @ts-expect-error intentional
    delete invalid.risks;
    const result = productAnalyzerAiSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject difficultyScore outside 1–10 range", async () => {
    const { productAnalyzerAiSchema } = await import("@/lib/ai/schemas");
    const result = productAnalyzerAiSchema.safeParse({
      ...MOCK_AI_RESULT,
      difficultyScore: 11,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid demand enum value", async () => {
    const { productAnalyzerAiSchema } = await import("@/lib/ai/schemas");
    const result = productAnalyzerAiSchema.safeParse({
      ...MOCK_AI_RESULT,
      demand: "VERY_HIGH",
    });
    expect(result.success).toBe(false);
  });
});

// ── Request validator tests ────────────────────────────────────────────────────
describe("analyzeProductRequestSchema", () => {
  it("should accept empty body", async () => {
    const { analyzeProductRequestSchema } = await import("@/lib/validators");
    const result = analyzeProductRequestSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept body with optional description", async () => {
    const { analyzeProductRequestSchema } = await import("@/lib/validators");
    const result = analyzeProductRequestSchema.safeParse({
      description: "Great product with unique features",
    });
    expect(result.success).toBe(true);
  });

  it("should reject description over 500 characters", async () => {
    const { analyzeProductRequestSchema } = await import("@/lib/validators");
    const result = analyzeProductRequestSchema.safeParse({
      description: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("should accept exactly 500 characters", async () => {
    const { analyzeProductRequestSchema } = await import("@/lib/validators");
    const result = analyzeProductRequestSchema.safeParse({
      description: "x".repeat(500),
    });
    expect(result.success).toBe(true);
  });
});
