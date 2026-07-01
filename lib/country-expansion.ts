export interface HistoricalCountryData {
  country: string;
  category: string;
  totalTests: number;
  winners: number;
  avgRoas: number;
}

export function generateCountryRecommendations(
  currentCategory: string,
  winningCountry: string,
  testedCountries: string[],
  historicalData: HistoricalCountryData[]
): { recommendedCountries: string[]; confidenceScore: number } {
  // Filter history to current category only
  const categoryHistory = historicalData.filter(h => h.category === currentCategory);
  
  // Create a map to aggregate by country
  const countryAggMap = new Map<string, { total: number, winners: number, sumRoas: number }>();
  
  for (const h of categoryHistory) {
    if (h.country === winningCountry || testedCountries.includes(h.country)) continue;
    
    if (!countryAggMap.has(h.country)) {
      countryAggMap.set(h.country, { total: 0, winners: 0, sumRoas: 0 });
    }
    
    const d = countryAggMap.get(h.country)!;
    d.total += h.totalTests;
    d.winners += h.winners;
    // Assuming avgRoas is an average of tests, we just weigh it by total tests to get sum
    d.sumRoas += h.avgRoas * h.totalTests;
  }
  
  const rankings = Array.from(countryAggMap.entries()).map(([country, data]) => {
    const winRate = data.total > 0 ? (data.winners / data.total) * 100 : 0;
    const avgRoas = data.total > 0 ? (data.sumRoas / data.total) : 0;
    
    // Score based on (Win Rate % * 0.7) + (Historical ROAS * 0.3)
    const score = (winRate * 0.7) + (avgRoas * 0.3);
    
    return { country, score, total: data.total };
  });
  
  rankings.sort((a, b) => b.score - a.score);
  
  const topRecommendations = rankings.slice(0, 3);
  
  // Confidence score based on sample size of the top recommendation
  let confidenceScore = 0;
  if (topRecommendations.length > 0) {
    const highestTotal = topRecommendations[0].total;
    if (highestTotal > 20) confidenceScore = 95;
    else if (highestTotal > 10) confidenceScore = 80;
    else if (highestTotal > 5) confidenceScore = 50;
    else confidenceScore = 20;
  }
  
  return {
    recommendedCountries: topRecommendations.map(r => r.country),
    confidenceScore
  };
}
