export interface MarketIntelligenceRequest {
  topic: string;
  market?: string;
  questions?: string[];
}

export interface MarketIntelligenceReport {
  topic: string;
  market?: string;
  questions: string[];
  limitations: string[];
  nextActions: string[];
}

export function createMarketIntelligenceBrief(
  request: MarketIntelligenceRequest
): MarketIntelligenceReport {
  const topic = request.topic.trim();
  if (!topic) throw new Error("A market intelligence topic is required.");

  return {
    topic,
    market: request.market?.trim() || undefined,
    questions: request.questions ?? [],
    limitations: [
      "Live market data requires a configured research/data provider.",
      "L.E.O. must not invent prices, metrics, ad performance or financial facts."
    ],
    nextActions: [
      "Collect current public sources.",
      "Separate observed facts from inference.",
      "Record source timestamps.",
      "Quantify confidence and data quality before making recommendations."
    ]
  };
}
