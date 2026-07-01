export interface ImportScoreInputs {
  researchScore: number | null;
  countriesWon: number;
  trueProfit: number;
  avgDeliveryRate: number;
  avgConfirmationRate: number;
  moq: number | null;
  leadTime: number | null;
  importFreight: number | null;
  productCost: number;
  targetBudget: number; // The user's available capital or standard threshold (e.g., $5,000)
}

export function calculateImportReadiness(inputs: ImportScoreInputs): {
  score: number;
  label: "IMPORT READY" | "TEST MORE" | "DO NOT IMPORT";
  breakdown: Record<string, number>;
} {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // 1. Research Score (Weight: 20)
  const rs = inputs.researchScore || 0;
  const rsScore = Math.min(20, (rs / 100) * 20);
  score += rsScore;
  breakdown.research = rsScore;

  // 2. Real Profit (Weight: 25)
  // If trueProfit is 0 or negative, 0 points.
  // We'll scale up to 25 based on an arbitrary "good" profit figure (e.g. $1,000).
  const profitScore = inputs.trueProfit > 0 ? Math.min(25, (inputs.trueProfit / 1000) * 25) : 0;
  score += profitScore;
  breakdown.profit = profitScore;

  // 3. Delivery Rate (Weight: 20)
  const drScore = Math.max(0, Math.min(20, ((inputs.avgDeliveryRate - 40) / 60) * 20)); // Assume <40% is 0 pts
  score += drScore;
  breakdown.deliveryRate = drScore;

  // 4. Confirmation Rate (Weight: 15)
  const crScore = Math.max(0, Math.min(15, ((inputs.avgConfirmationRate - 40) / 60) * 15));
  score += crScore;
  breakdown.confirmationRate = crScore;

  // 5. Countries Won (Weight: 10)
  const cwScore = Math.min(10, inputs.countriesWon * 5); // 2 countries = 10 pts
  score += cwScore;
  breakdown.countriesWon = cwScore;

  // 6. MOQ Feasibility (Weight: 5)
  // Required Capital
  let moqScore = 5;
  if (inputs.moq && inputs.importFreight) {
    const requiredCapital = inputs.moq * (inputs.productCost + inputs.importFreight);
    if (requiredCapital > inputs.targetBudget) {
      moqScore = 0;
    }
  }
  score += moqScore;
  breakdown.moqFeasibility = moqScore;

  // 7. Lead Time (Weight: 5)
  let ltScore = 5;
  if (inputs.leadTime) {
    if (inputs.leadTime > 30) ltScore = 0;
    else if (inputs.leadTime > 15) ltScore = 2.5;
  }
  score += ltScore;
  breakdown.leadTime = ltScore;

  // Round final score
  score = Math.round(score);

  // Label
  let label: "IMPORT READY" | "TEST MORE" | "DO NOT IMPORT" = "DO NOT IMPORT";
  if (score >= 85) label = "IMPORT READY";
  else if (score >= 70) label = "TEST MORE";

  return { score, label, breakdown };
}
