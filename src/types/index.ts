// SignalLens AI - Core Type Definitions

export interface Review {
  review_id: string;
  date: string;
  restaurant: string;
  rating: number;
  review_text: string;
  visit_type: string;
  location?: string;
  meal_type?: string;
}

export interface DatasetSummary {
  total_reviews: number;
  duplicates_removed: number;
  date_range: {
    start: string | null;
    end: string | null;
  };
  restaurants: number;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface SentimentSummary {
  overall_avg: number;
  overall_std: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  avg_rating: number | null;
  rating_std: number | null;
  rating_distribution: Record<string, number>;
}

export interface MonthlyTrend {
  period: string;
  avg_rating: number;
  avg_sentiment: number;
  review_count: number;
  median_rating: number;
}

export interface DayOfWeekTrend {
  day: string;
  avg_rating: number;
  avg_sentiment: number;
  review_count: number;
}

export interface TrendsData {
  monthly_trends: MonthlyTrend[];
  day_of_week_trends: DayOfWeekTrend[];
  trend_direction: 'declining' | 'improving' | 'stable' | 'insufficient_data';
  trend_slope: number;
}

export interface TopicMonthly {
  month: string;
  frequency_pct: number;
  mentions: number;
  total_reviews: number;
}

export interface TopicFrequency {
  topic: string;
  topic_key: string;
  monthly_data: TopicMonthly[];
  total_mentions: number;
}

export interface TopicSentiment {
  topic: string;
  topic_key: string;
  avg_sentiment: number;
  overall_avg_sentiment: number;
  sentiment_diff: number;
  avg_rating: number | null;
  sample_size: number;
}

export interface TopicChange {
  topic: string;
  topic_key: string;
  before_frequency_pct: number;
  after_frequency_pct: number;
  frequency_change_pct: number;
  before_sentiment: number;
  after_sentiment: number;
  before_mentions: number;
  after_mentions: number;
}

export interface BeforeAfterComparison {
  change_detected: boolean;
  change_point?: string;
  before_period?: string;
  after_period?: string;
  reason?: string;
  metrics?: {
    rating: {
      before: number;
      after: number;
      change: number;
      pct_change: number;
    };
    sentiment: {
      before: number;
      after: number;
      change: number;
      pct_change: number;
    };
  };
  sample_sizes?: {
    before: number;
    after: number;
  };
  topic_changes?: TopicChange[];
}

export interface SegmentData {
  segment_value: string;
  avg_rating: number;
  avg_sentiment: number;
  count: number;
  diff_from_overall: number;
}

export interface SegmentComparison {
  segment_type: string;
  segment_label: string;
  segments: SegmentData[];
}

export interface Anomaly {
  type: string;
  period: string;
  metric: string;
  value: number;
  z_score: number;
  direction: string;
  severity: 'high' | 'medium' | 'low';
  sample_size?: number;
  description: string;
}

export interface Evidence {
  id: string;
  type: string;
  title: string;
  description: string;
  metric: string;
  baseline: number | null;
  current: number | null;
  change: number | null;
  pct_change: number | null;
  z_score?: number;
  sample_size: number;
  confidence: string;
  time_range?: string;
}

export interface AIInsight {
  what_changed: string;
  why_hypothesis: string;
  evidence_citations: string[];
  supporting_evidence: {
    metric: string;
    detail: string;
  }[];
  recommended_investigation: string[];
  confidence_level: 'high' | 'medium' | 'low';
  disclaimer: string;
}

export interface InvestigationResult {
  topic: string;
  possible_explanation: string;
  evidence: {
    metric: string;
    value: string;
  }[];
  hypothesis: string;
  hypothesis_disclaimer: string;
  recommended_actions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  error: boolean;
  message?: string;
  dataset_summary: DatasetSummary;
  sentiment: SentimentSummary;
  reputation_momentum: number;
  trends: TrendsData;
  topics: TopicFrequency[];
  topic_sentiment: TopicSentiment[];
  before_after: BeforeAfterComparison;
  segment_comparisons: SegmentComparison[];
  anomalies: Anomaly[];
  evidence: Evidence[];
  ai_insight?: AIInsight;
  investigation?: InvestigationResult;
  analysis_id?: string;
  is_demo?: boolean;
  is_mock_ai?: boolean;
}

export interface AnalysisState {
  status: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  progressMessage: string;
  result: AnalysisResult | null;
  error: string | null;
}
