import { AIInsight, InvestigationResult } from '@/types';

export const mockAiInsight: AIInsight = {
  what_changed: "There has been a significant decline in overall sentiment, primarily driven by a 187% spike in complaints regarding delivery and a 142% increase in wait-time complaints during the most recent period.",
  why_hypothesis: "The restaurant may be experiencing severe operational bottlenecks during peak hours, particularly on weekends. The simultaneous increase in both delivery issues and dine-in wait times suggests the kitchen or staff is struggling to handle combined order volumes.",
  evidence_citations: [
    "Average rating declined from 4.2 to 3.8",
    "Delivery mentions increased by 187% with negative sentiment",
    "Wait-time mentions increased by 142% with negative sentiment",
    "Weekend performance gap widened significantly compared to weekdays"
  ],
  supporting_evidence: [
    { metric: "Delivery frequency", detail: "Spiked from 12% to 34% of all reviews" },
    { metric: "Wait time sentiment", detail: "Dropped from -0.1 to -0.6 on average" }
  ],
  recommended_investigation: [
    "Review kitchen ticket times during weekend peak hours (Friday/Saturday 6PM-9PM)",
    "Compare staffing levels for delivery vs. dine-in coordination",
    "Evaluate if third-party delivery tablets are overwhelming the kitchen capacity",
    "Investigate packaging issues for delivery items causing 'cold food' complaints"
  ],
  confidence_level: "high",
  disclaimer: "AI-generated hypothesis based on statistical text analysis. Not confirmed causation."
};

export const mockInvestigationResult: InvestigationResult = {
  topic: "Delivery & Wait Times",
  possible_explanation: "The kitchen capacity is likely being exceeded by concurrent dine-in and delivery orders during peak weekend periods.",
  evidence: [
    { metric: "Delivery mentions", value: "+187%" },
    { metric: "Wait-time mentions", value: "+142%" },
    { metric: "Weekend rating gap", value: "-0.8 vs weekdays" }
  ],
  hypothesis: "Staffing or kitchen workflows are not optimized for handling high-volume omnichannel (dine-in + delivery) demand simultaneously.",
  hypothesis_disclaimer: "This is an AI-generated hypothesis derived from text patterns and should be validated with internal operational data.",
  recommended_actions: [
    "Consider pausing third-party delivery apps when dine-in wait times exceed 30 minutes",
    "Add a dedicated expeditor for delivery orders during weekends",
    "Audit delivery packaging to improve heat retention"
  ],
  confidence: "high"
};
