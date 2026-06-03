/**
 * Sprint 3C — Winning Probability Service Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module mocks ──────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    winningProbabilityAnalysis: {
      create: vi.fn(),
    },
  },
}));

const { mockGenerate } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
}));

vi.mock("@/lib/ai/gateway", () => ({
  AIGateway: vi.fn().mockImplementation(class {
    generate = mockGenerate;
  }),
}));

import { prisma } from "@/lib/prisma";
import {
  WinningProbabilityService,
  WinningProbabilityNotFoundError,
  WinningProbabilityAIError,
  WinningProbabilityPrerequisiteError,
} from "@/lib/ai/winning-probability";

// ── Shared test fixtures ───────────────────────────────────────────────────────
const MOCK_PROJECT = {
  id: "proj_123",
  userId: "user_123",
  productName: "Test Product",
  productCost: { toNumber: () => 10 },
  sellingPrice: { toNumber: () => 30 },
  shippingCost: { toNumber: () => 0 },
  serviceFee: { toNumber: () => 0 },
  desiredProfit: { toNumber: () => 5 },
  productScore: 8,
  marketScore: 7,
  riskScore: "LOW",
  createdAt: new Date(),
  updatedAt: new Date(),
  productAnalyses: [
    {
      opportunityScoreInputs: {
        productScore: 8,
        marketScore: 7,
        riskScore: "LOW",
        difficultyScore: 4,
        marketOpportunity: 8,
      },
    },
  ],
};

const MOCK_PROJECT_NO_SCORES = {
  ...MOCK_PROJECT,
  productScore: null,
  marketScore: null,
  riskScore: null,
  productAnalyses: [],
};

const MOCK_AI_RESULT = {
  winningProbability: 85,
  confidenceScore: 90,
  reasoning: ["High margins", "Low competition"],
  recommendation: "TEST",
};

describe("WinningProbabilityService", () => {
  let service: WinningProbabilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WinningProbabilityService();
  });

  describe("analyze()", () => {
    it("should process a valid analysis request successfully", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT);
      vi.mocked(prisma.winningProbabilityAnalysis.create).mockResolvedValue({ id: "analysis_123", ...MOCK_AI_RESULT } as any);
      vi.mocked(prisma.project.update).mockResolvedValue(MOCK_PROJECT as any);

      const result = await service.analyze({ userId: "user_123", projectId: "proj_123" });

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: "proj_123", userId: "user_123" },
        include: { productAnalyses: { orderBy: { createdAt: "desc" }, take: 1 } },
      });

      expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({
        feature: "opportunity-score",
        userId: "user_123",
      }));

      expect(prisma.winningProbabilityAnalysis.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: "proj_123",
          winningProbability: 85,
          confidenceScore: 90,
          recommendation: "TEST",
        }),
      });

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: "proj_123" },
        data: expect.objectContaining({
          winningProbability: 85,
          confidenceScore: 90,
          opportunityRecommendation: "TEST",
        }),
      });

      expect(result.project).toBeDefined();
    });

    it("should throw WinningProbabilityPrerequisiteError if prerequisite scores are missing", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(MOCK_PROJECT_NO_SCORES as any);

      await expect(
        service.analyze({ userId: "user_123", projectId: "proj_123" })
      ).rejects.toThrow(WinningProbabilityPrerequisiteError);

      expect(mockGenerate).not.toHaveBeenCalled();
    });

    it("should throw WinningProbabilityNotFoundError if project is not found", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

      await expect(
        service.analyze({ userId: "user_123", projectId: "proj_123" })
      ).rejects.toThrow(WinningProbabilityNotFoundError);

      expect(mockGenerate).not.toHaveBeenCalled();
    });

    it("should throw WinningProbabilityAIError if gateway fails", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockRejectedValue(new Error("Gateway timeout"));

      await expect(
        service.analyze({ userId: "user_123", projectId: "proj_123" })
      ).rejects.toThrow(WinningProbabilityAIError);
    });
  });
});
