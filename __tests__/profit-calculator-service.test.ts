import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module mocks ──────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    profitAnalysis: {
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
  ProfitCalculatorService,
  ProfitCalculatorNotFoundError,
  ProfitCalculatorAIError,
} from "@/lib/ai/profit-calculator";

// ── Shared test fixtures ───────────────────────────────────────────────────────
const MOCK_PROJECT = {
  id: "proj_123",
  userId: "user_123",
  productName: "Test Product",
  category: "Electronics",
  targetCountry: "Morocco",
  productCost: { toNumber: () => 10 },
  sellingPrice: { toNumber: () => 30 },
  shippingCost: { toNumber: () => 2 },
  serviceFee: { toNumber: () => 1 },
  desiredProfit: { toNumber: () => 5 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_AI_RESULT = {
  assumptions: [
    "Shipping costs to remote regions may increase total cost.",
    "Cash on delivery could reduce the actual margin by 5% due to returns."
  ]
};

describe("ProfitCalculatorService", () => {
  let service: ProfitCalculatorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProfitCalculatorService();
  });

  describe("analyze()", () => {
    it("should process a valid profit calculation and AI generation successfully", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockResolvedValue(MOCK_AI_RESULT);
      
      const mockCreatedAnalysis = { 
        id: "analysis_123", 
        revenue: 30,
        margin: 17,
        marginPercent: 56.67,
        breakEvenCpl: 0.51,
        breakEvenCpa: 17,
        targetCpl: 0.36,
        targetCpa: 12,
        minCpl: 0.29,
        recommendedCpl: 0.36,
        maxCpl: 0.51,
        assumptions: MOCK_AI_RESULT.assumptions
      };
      
      vi.mocked(prisma.profitAnalysis.create).mockResolvedValue(mockCreatedAnalysis as any);
      vi.mocked(prisma.project.update).mockResolvedValue({ ...MOCK_PROJECT, profitAssumptions: MOCK_AI_RESULT.assumptions } as any);

      const result = await service.analyze({ userId: "user_123", projectId: "proj_123" });

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: "proj_123", userId: "user_123" },
      });

      expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({
        feature: "profit-calculator",
        userId: "user_123",
      }));

      expect(prisma.profitAnalysis.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: "proj_123",
          revenue: 30,
          margin: 17, // 30 - (10 + 2 + 1)
          assumptions: MOCK_AI_RESULT.assumptions,
        }),
      });

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: "proj_123" },
        data: expect.objectContaining({
          margin: 17,
          profitAssumptions: MOCK_AI_RESULT.assumptions,
        }),
      });

      expect(result.project).toBeDefined();
    });

    it("should throw ProfitCalculatorNotFoundError if project is not found", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

      await expect(
        service.analyze({ userId: "user_123", projectId: "proj_123" })
      ).rejects.toThrow(ProfitCalculatorNotFoundError);

      expect(mockGenerate).not.toHaveBeenCalled();
    });

    it("should throw ProfitCalculatorAIError if gateway fails", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(MOCK_PROJECT as any);
      mockGenerate.mockRejectedValue(new Error("Gateway timeout"));

      await expect(
        service.analyze({ userId: "user_123", projectId: "proj_123" })
      ).rejects.toThrow(ProfitCalculatorAIError);
    });
  });
});
