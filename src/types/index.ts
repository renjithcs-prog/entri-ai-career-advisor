export type IndicatorLevel = "High" | "Medium" | "Growing";

export interface Course {
  id: string;
  title: string;
  category: string[];
  group: string;
  description: string;
  goals: string[];
  minQualification: string;
  statuses: string[];
  timelineFit: string[];
  level: "beginner" | "intermediate" | "advanced";
  durationWeeks: number;
  careerOpportunities: string[];
  demandIndicator: IndicatorLevel;
  futureGrowthIndicator: IndicatorLevel;
  tags: string[];
}

export interface Question {
  id: keyof Answers;
  title: string;
  subtitle?: string;
  type: "single" | "multi";
  maxSelect?: number;
  options: string[];
}

export interface Answers {
  goal: string | null;
  qualification: string | null;
  status: string | null;
  careerType: string[];
  timeline: string | null;
}

export interface MatchSignals {
  goal: boolean;
  careerType: boolean;
  careerTypeCount: number;
  status: boolean;
  timeline: boolean;
}

export interface ScoredCourse {
  course: Course;
  score: number;
  signals: MatchSignals;
  careerMatches: string[];
  whyFits: string;
}

export interface RecommendationResult {
  topPicks: ScoredCourse[];
  alsoLike: ScoredCourse[];
  personalSummary: string;
  profileNarrative: string;
}

export type AppScreen = "welcome" | "question" | "loading" | "results";
