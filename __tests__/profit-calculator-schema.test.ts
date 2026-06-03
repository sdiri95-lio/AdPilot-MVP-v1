import { describe, it, expect } from "vitest";
import { profitCalculatorAiSchema } from "@/lib/ai/schemas";

const MOCK_VALID_AI_RESULT = {
  assumptions: [
    "Shipping costs to remote regions may increase total cost.",
    "Cash on delivery could reduce the actual margin by 5% due to returns."
  ]
};

describe("profitCalculatorAiSchema", () => {
  it("should validate a complete, valid AI response", () => {
    const result = profitCalculatorAiSchema.safeParse(MOCK_VALID_AI_RESULT);
    expect(result.success).toBe(true);
  });

  it("should reject reasoning array with less than 2 items", () => {
    const result = profitCalculatorAiSchema.safeParse({
      ...MOCK_VALID_AI_RESULT,
      assumptions: ["Only one assumption."]
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing assumptions field", () => {
    const { assumptions, ...missingAssumptions } = MOCK_VALID_AI_RESULT;
    const result = profitCalculatorAiSchema.safeParse(missingAssumptions);
    expect(result.success).toBe(false);
  });
});
