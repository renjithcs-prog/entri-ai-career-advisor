/**
 * Rule-based recommendation engine.
 * Swap `generateRecommendations` internals with an LLM API call (Claude/OpenAI) later.
 */

import type {
  Answers,
  Course,
  MatchSignals,
  RecommendationResult,
} from "../types";

export const WEIGHTS = {
  goal: 40,
  careerTypeSingle: 35,
  careerTypeDouble: 50,
  status: 15,
  timeline: 10,
};

const MIN_SCORE = 20;

const QUAL_RANK: Record<string, number> = {
  SSLC: 0,
  "Plus Two": 1,
  "Diploma / ITI": 2,
  Degree: 3,
  Postgraduate: 4,
  Other: -1,
};

const TIMELINE_ALIASES: Record<string, string[]> = {
  "Immediately (0–3 Months)": ["Immediately (0–3 months)", "Immediately (0–3 Months)"],
  "Within 6 Months": ["Within 6 months", "Within 6 Months"],
  "Within 1 Year": ["Within 1 year", "Within 1 Year"],
  "Just Exploring": ["Just Exploring"],
};

function isEligible(course: Course, qualification: string | null): boolean {
  if (!qualification) return true;
  const userRank = QUAL_RANK[qualification];
  const courseRank = QUAL_RANK[course.minQualification];
  if (userRank === -1 || courseRank === -1) return true;
  if (userRank === undefined || courseRank === undefined) return true;
  return userRank >= courseRank;
}

function timelineMatches(course: Course, timeline: string | null): boolean {
  if (!timeline) return false;
  const aliases = TIMELINE_ALIASES[timeline] ?? [timeline];
  return course.timelineFit.some((t) =>
    aliases.some((a) => t.toLowerCase() === a.toLowerCase())
  );
}

function getCareerMatches(course: Course, types: string[]): string[] {
  return types.filter((t) => course.category.includes(t));
}

function statusMatches(course: Course, status: string | null): boolean {
  if (!status || status === "Other") return true;
  return course.statuses.includes(status);
}

export function scoreCourse(course: Course, answers: Answers) {
  const signals: MatchSignals = {
    goal: false,
    careerType: false,
    careerTypeCount: 0,
    status: false,
    timeline: false,
  };

  let score = 0;
  const unsure = answers.goal === "I'm Not Sure Yet";

  if (!unsure && answers.goal && course.goals.includes(answers.goal)) {
    score += WEIGHTS.goal;
    signals.goal = true;
  }

  const careerMatches = getCareerMatches(course, answers.careerType);
  if (careerMatches.length === 2) {
    score += WEIGHTS.careerTypeDouble;
    signals.careerType = true;
    signals.careerTypeCount = 2;
  } else if (careerMatches.length === 1) {
    score += WEIGHTS.careerTypeSingle;
    signals.careerType = true;
    signals.careerTypeCount = 1;
  }

  if (statusMatches(course, answers.status)) {
    score += WEIGHTS.status;
    signals.status = true;
  }

  if (timelineMatches(course, answers.timeline)) {
    score += WEIGHTS.timeline;
    signals.timeline = true;
  }

  if (unsure && signals.careerType) score += 15;
  if (unsure && signals.status) score += 10;

  return { score, signals, careerMatches };
}

function formatQualification(q: string | null): string {
  const map: Record<string, string> = {
    SSLC: "SSLC graduate",
    "Plus Two": "Plus Two graduate",
    Degree: "graduate",
    Other: "learner",
  };
  return map[q ?? ""] ?? "learner";
}

function formatStatus(s: string | null): string {
  const map: Record<string, string> = {
    Student: "student",
    "Job Seeker": "job seeker",
    "Working Professional": "working professional",
    Other: "learner",
  };
  return map[s ?? ""] ?? "learner";
}

function formatGoal(g: string | null): string {
  const map: Record<string, string> = {
    "Get a Government Job": "secure a government job",
    "Get a Private Job": "land a private-sector role",
    "Switch My Career": "switch your career",
    "I'm Not Sure Yet": "explore the right path",
  };
  return map[g ?? ""] ?? "reach your goals";
}

function formatTimeline(t: string | null): string {
  const map: Record<string, string> = {
    "Immediately (0–3 Months)": "the next few months",
    "Within 6 Months": "the next six months",
    "Within 1 Year": "the coming year",
    "Just Exploring": "at your own pace while you explore",
  };
  return map[t ?? ""] ?? "your timeline";
}

function formatCareerLabel(matches: string[], fallback: string[]): string {
  const list = matches.length ? matches : fallback;
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return list[0] ?? "your chosen field";
}

function formatDuration(weeks: number): string {
  if (weeks <= 6) return `${weeks} weeks`;
  const months = Math.round(weeks / 4);
  return months <= 1 ? "~1 month" : `~${months} months`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** LLM swap point: replace template logic with API-generated explanations */
export function buildWhyFits(
  course: Course,
  signals: MatchSignals,
  careerMatches: string[],
  answers: Answers
): string {
  const domain = formatCareerLabel(careerMatches, answers.careerType);
  const qual = formatQualification(answers.qualification);
  const goal = formatGoal(answers.goal);
  const timeline = formatTimeline(answers.timeline);

  if (signals.goal && signals.careerType && signals.timeline) {
    return `Based on your profile, you are a ${qual} looking to ${goal} in ${domain} within ${timeline}. ${course.title} is a strong choice because it offers ${course.demandIndicator.toLowerCase()} job demand, ${course.futureGrowthIndicator.toLowerCase()} growth potential, and a ${course.level} learning path you can complete in ${formatDuration(course.durationWeeks)}.`;
  }

  if (signals.careerType && signals.goal) {
    return `Since you want to ${goal} and are drawn to ${domain}, ${course.title} bridges your interests with real hiring demand. Roles like ${course.careerOpportunities.slice(0, 2).join(" and ")} are actively hiring learners with this skill set.`;
  }

  if (signals.careerType && signals.status) {
    return `As a ${formatStatus(answers.status)} interested in ${domain}, ${course.title} gives you practical, placement-friendly skills. It aligns with your background and opens doors to ${course.careerOpportunities[0]} and similar roles.`;
  }

  if (signals.goal && signals.timeline) {
    return `Your goal to ${goal} within ${timeline} makes ${course.title} a smart fit — it's structured for ${course.level} learners and designed to deliver results in ${formatDuration(course.durationWeeks)}.`;
  }

  if (signals.careerType) {
    return `${course.title} stands out for your interest in ${domain}. With ${course.demandIndicator.toLowerCase()} market demand and ${course.futureGrowthIndicator.toLowerCase()} future growth, it's a practical path toward ${course.careerOpportunities[0]}.`;
  }

  return `${course.title} matches several signals from your answers and remains one of Entri's most recommended paths for learners with a profile like yours.`;
}

export function buildPersonalSummary(answers: Answers): string {
  const qual = formatQualification(answers.qualification);
  const status = formatStatus(answers.status);
  const goal = answers.goal;
  const domains = answers.careerType.join(" and ") || "multiple fields";

  if (goal === "Switch My Career") {
    return `You are a ${qual} ${status} ready to switch into ${domains}. Practical, skill-based courses with strong placement support will give you the fastest return on learning — especially paths that balance beginner-friendly structure with high employer demand.`;
  }

  if (goal === "Get a Government Job") {
    return `You are focused on stable government career growth with long-term security. Structured exam-prep and discipline-driven learning paths in ${domains} will suit your profile best.`;
  }

  if (goal === "Get a Private Job") {
    return `You are someone looking for stable career growth with strong placement opportunities. Since you're interested in ${domains}, industry-aligned courses with job-ready outcomes will help you move quickly from learning to earning.`;
  }

  return `You are exploring your next step as a ${qual} ${status}. Courses in ${domains} that offer flexibility, clear outcomes, and mentor support will help you discover the right direction without pressure.`;
}

export function buildProfileNarrative(answers: Answers): string {
  return `You're a ${formatQualification(answers.qualification)} ${formatStatus(answers.status)} looking to ${formatGoal(answers.goal)} within ${formatTimeline(answers.timeline)}.`;
}

export function generateRecommendations(
  courses: Course[],
  answers: Answers
): RecommendationResult {
  const eligible = courses.filter((c) => isEligible(c, answers.qualification));

  const scored = eligible
    .map((course) => {
      const { score, signals, careerMatches } = scoreCourse(course, answers);
      return {
        course,
        score,
        signals,
        careerMatches,
        whyFits: "",
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.course.durationWeeks - b.course.durationWeeks;
    });

  const qualified = scored.filter((s) => s.score >= MIN_SCORE);
  const pool = qualified.length >= 3 ? qualified : scored;

  const topPicks = pool.slice(0, 3).map((item) => ({
    ...item,
    whyFits: buildWhyFits(item.course, item.signals, item.careerMatches, answers),
  }));

  const usedIds = new Set(topPicks.map((t) => t.course.id));
  const alsoLike = pool
    .filter((s) => !usedIds.has(s.course.id))
    .slice(0, 3)
    .map((item) => ({
      ...item,
      whyFits: buildWhyFits(item.course, item.signals, item.careerMatches, answers),
    }));

  return {
    topPicks,
    alsoLike,
    personalSummary: buildPersonalSummary(answers),
    profileNarrative: buildProfileNarrative(answers),
  };
}

export function formatDifficulty(level: Course["level"]): string {
  return capitalize(level);
}

export function formatLearningTime(weeks: number): string {
  return formatDuration(weeks);
}
