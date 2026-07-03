/**
 * Entri AI Career Advisor — vanilla JS
 * Recommendation weights & LLM swap point marked below.
 */

const WEIGHTS = {
  goal: 40,
  careerTypeSingle: 35,
  careerTypeDouble: 50,
  status: 15,
  timeline: 10,
};

const MIN_SCORE = 20;

/** Government exam prep courses — shown in full when user picks Government Services */
const GOVERNMENT_EXAM_IDS = [
  "kerala-psc",
  "kpsc-technical-exams",
  "kpsc-teaching",
  "banking",
  "ssc",
  "rrb-railways",
  "teaching-national",
  "other-exams",
];

const QUAL_RANK = {
  SSLC: 0,
  "Plus Two": 1,
  "Diploma / ITI": 2,
  Degree: 3,
  Postgraduate: 4,
  Other: -1,
};

const TIMELINE_ALIASES = {
  "Immediately (0–3 Months)": ["Immediately (0–3 months)", "Immediately (0–3 Months)"],
  "Within 6 Months": ["Within 6 months", "Within 6 Months"],
  "Within 1 Year": ["Within 1 year", "Within 1 Year"],
  "Just Exploring": ["Just Exploring"],
};

let courses = [];
let questions = [];

const state = {
  screen: "welcome",
  stepIndex: 0,
  answers: {
    goal: null,
    qualification: null,
    status: null,
    careerType: [],
    timeline: null,
  },
  lead: {
    name: "",
    phone: "",
  },
  leadFormAttempted: false,
  result: null,
  submitting: false,
};

const screenEl = document.getElementById("screen");
const mainEl = document.getElementById("main");
const announceEl = document.getElementById("sr-announce");

/* ── Recommendation engine (swap generateRecommendations for LLM API later) ── */

function isEligible(course, qualification) {
  if (!qualification) return true;
  const userRank = QUAL_RANK[qualification];
  const courseRank = QUAL_RANK[course.minQualification];
  if (userRank === -1 || courseRank === -1) return true;
  if (userRank === undefined || courseRank === undefined) return true;
  return userRank >= courseRank;
}

function timelineMatches(course, timeline) {
  if (!timeline) return false;
  const aliases = TIMELINE_ALIASES[timeline] || [timeline];
  return course.timelineFit.some((t) =>
    aliases.some((a) => t.toLowerCase() === a.toLowerCase())
  );
}

function getCareerMatches(course, types) {
  return types.filter((t) => course.category.includes(t));
}

function statusMatches(course, status) {
  if (!status || status === "Other") return true;
  return course.statuses.includes(status);
}

function scoreCourse(course, answers) {
  const signals = { goal: false, careerType: false, careerTypeCount: 0, status: false, timeline: false };
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

function formatQualification(q) {
  return { SSLC: "SSLC graduate", "Plus Two": "Plus Two graduate", Degree: "graduate", Other: "learner" }[q] || "learner";
}

function formatStatus(s) {
  return { Student: "student", "Job Seeker": "job seeker", "Working Professional": "working professional", Other: "learner" }[s] || "learner";
}

function formatGoal(g) {
  return {
    "Get a Government Job": "secure a government job",
    "Get a Private Job": "land a private-sector role",
    "Switch My Career": "switch your career",
    "I'm Not Sure Yet": "explore the right path",
  }[g] || "reach your goals";
}

function formatTimeline(t) {
  return {
    "Immediately (0–3 Months)": "the next few months",
    "Within 6 Months": "the next six months",
    "Within 1 Year": "the coming year",
    "Just Exploring": "at your own pace while you explore",
  }[t] || "your timeline";
}

function formatCareerLabel(matches, fallback) {
  const list = matches.length ? matches : fallback;
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return list[0] || "your chosen field";
}

function formatDuration(weeks) {
  if (weeks <= 6) return `${weeks} weeks`;
  const months = Math.round(weeks / 4);
  return months <= 1 ? "~1 month" : `~${months} months`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** LLM swap point: replace with API-generated explanations */
function buildWhyFits(course, signals, careerMatches, answers) {
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

function buildPersonalSummary(answers) {
  const qual = formatQualification(answers.qualification);
  const status = formatStatus(answers.status);
  const domains = answers.careerType.join(" and ") || "multiple fields";

  if (answers.goal === "Switch My Career") {
    return `You are a ${qual} ${status} ready to switch into ${domains}. Practical, skill-based courses with strong placement support will give you the fastest return on learning — especially paths that balance beginner-friendly structure with high employer demand.`;
  }
  if (answers.goal === "Get a Government Job") {
    return `You are focused on stable government career growth with long-term security. Structured exam-prep and discipline-driven learning paths in ${domains} will suit your profile best.`;
  }
  if (answers.goal === "Get a Private Job") {
    return `You are someone looking for stable career growth with strong placement opportunities. Since you're interested in ${domains}, industry-aligned courses with job-ready outcomes will help you move quickly from learning to earning.`;
  }
  return `You are exploring your next step as a ${qual} ${status}. Courses in ${domains} that offer flexibility, clear outcomes, and mentor support will help you discover the right direction without pressure.`;
}

function buildProfileNarrative(answers) {
  return `You're a ${formatQualification(answers.qualification)} ${formatStatus(answers.status)} looking to ${formatGoal(answers.goal)} within ${formatTimeline(answers.timeline)}.`;
}

function isGovernmentServicesPath(answers) {
  return answers.careerType.includes("Government Services");
}

function buildGovernmentWhyFits(course, answers) {
  const qual = formatQualification(answers.qualification);
  const timeline = formatTimeline(answers.timeline);
  const examFocus = course.careerOpportunities.slice(0, 2).join(" and ");

  return `As a ${qual} aiming for government roles, ${course.title} gives you structured test-prep aligned with your ${timeline} timeline. It prepares you for ${examFocus} with syllabus coverage, mock tests, and exam strategy — a proven Entri path for competitive government recruitment.`;
}

function buildGovernmentPersonalSummary(answers) {
  const qual = formatQualification(answers.qualification);
  const status = formatStatus(answers.status);
  return `You are a ${qual} ${status} focused on government services and public-sector careers. Explore Kerala PSC, KPSC Technical, Banking, SSC, RRB Railways, teaching exams, and more — pick the exam track that matches your qualification and target role, then commit to consistent prep for the best shot at a stable government job.`;
}

function generateGovernmentRecommendations(allCourses, answers) {
  const courseMap = new Map(allCourses.map((c) => [c.id, c]));

  const governmentPaths = GOVERNMENT_EXAM_IDS.map((id) => courseMap.get(id))
    .filter((course) => course && isEligible(course, answers.qualification))
    .map((course) => {
      const { score, signals, careerMatches } = scoreCourse(course, answers);
      return {
        course,
        score,
        signals,
        careerMatches,
        whyFits: buildGovernmentWhyFits(course, answers),
      };
    });

  return {
    isGovernmentTrack: true,
    governmentPaths,
    topPicks: governmentPaths.slice(0, 3),
    alsoLike: governmentPaths.slice(3),
    personalSummary: buildGovernmentPersonalSummary(answers),
    profileNarrative: buildProfileNarrative(answers),
  };
}

function generateRecommendations(allCourses, answers) {
  if (isGovernmentServicesPath(answers)) {
    return generateGovernmentRecommendations(allCourses, answers);
  }

  const eligible = allCourses.filter((c) => isEligible(c, answers.qualification));

  const scored = eligible
    .map((course) => {
      const { score, signals, careerMatches } = scoreCourse(course, answers);
      return { course, score, signals, careerMatches };
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
    isGovernmentTrack: false,
    governmentPaths: [],
    topPicks,
    alsoLike,
    personalSummary: buildPersonalSummary(answers),
    profileNarrative: buildProfileNarrative(answers),
  };
}

/* ── Confetti (lightweight canvas, no dependencies) ── */

function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#0061B5", "#0089FF", "#00805C", "#FFA000"];
  const particles = Array.from({ length: 80 }, () => ({
    x: canvas.width * 0.5,
    y: canvas.height * 0.55,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -14 - 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 6 + 4,
    life: 1,
  }));

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.life -= 0.012;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    }
    frame++;
    if (alive && frame < 120) requestAnimationFrame(tick);
    else canvas.remove();
  }
  requestAnimationFrame(tick);
}

/* ── Utilities ── */

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function indicatorClass(level) {
  if (level === "High") return "indicator--high";
  if (level === "Growing") return "indicator--growing";
  return "indicator--medium";
}

function getCurrentQuestion() {
  return questions[state.stepIndex] || null;
}

/** Question 4 options depend on goal (Q1): government job → Government Services only */
function getQuestionOptions(question) {
  if (question.id === "careerType" && state.answers.goal === "Get a Government Job") {
    return ["Government Services"];
  }
  return question.options;
}

function prepareStepAnswers() {
  const q = getCurrentQuestion();
  if (!q) return;

  if (q.id === "careerType" && state.answers.goal === "Get a Government Job") {
    state.answers.careerType = ["Government Services"];
  }
}

function getQuestionSubtitle(question) {
  if (question.id === "careerType" && state.answers.goal === "Get a Government Job") {
    return null;
  }
  return question.subtitle || null;
}

function getEffectiveMaxSelect(question) {
  const options = getQuestionOptions(question);
  if (question.type !== "multi") return 1;
  if (question.id === "careerType" && state.answers.goal === "Get a Government Job") {
    return 1;
  }
  return Math.min(question.maxSelect || 2, options.length);
}

function isStepValid() {
  const q = getCurrentQuestion();
  if (!q) return false;
  const val = state.answers[q.id];
  if (q.type === "multi") return Array.isArray(val) && val.length > 0;
  return val != null && val !== "";
}

function announce(text) {
  if (announceEl) announceEl.textContent = text;
}

function getGoogleScriptUrl() {
  return (window.ENTRI_CONFIG && window.ENTRI_CONFIG.GOOGLE_SCRIPT_URL) || "";
}

function isValidIndianPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(digits);
}

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function isLeadFormValid() {
  const name = state.lead.name.trim();
  const phone = normalizePhone(state.lead.phone);
  return name.length >= 2 && isValidIndianPhone(phone);
}

function getRecommendationTitles(result) {
  if (!result) return "";
  const items =
    result.isGovernmentTrack && result.governmentPaths?.length
      ? result.governmentPaths
      : [...(result.topPicks || []), ...(result.alsoLike || [])];
  return items.map((i) => i.course.title).join(", ");
}

async function submitLeadToSheet() {
  const url = getGoogleScriptUrl();
  const payload = {
    name: state.lead.name.trim(),
    phone: normalizePhone(state.lead.phone),
    goal: state.answers.goal || "",
    qualification: state.answers.qualification || "",
    status: state.answers.status || "",
    careerType: (state.answers.careerType || []).join(", "),
    timeline: state.answers.timeline || "",
    recommendations: getRecommendationTitles(state.result),
  };

  if (!url) {
    console.warn("GOOGLE_SCRIPT_URL not set in config.js — lead not saved.");
    return { success: false, skipped: true };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}

function showResults() {
  state.screen = "results";
  render();
  fireConfetti();
}

/* ── Renderers ── */

function renderWelcome() {
  screenEl.innerHTML = `
    <section class="welcome">
      <div class="welcome__icon" aria-hidden="true">🎯</div>
      <h1>Find Your Perfect Career Path</h1>
      <p class="welcome__subtitle">Answer a few quick questions and our AI Career Advisor will recommend the best learning path for you.</p>
      <p class="welcome__time">⏱ Estimated time: 60 Seconds</p>
      <button type="button" class="btn btn--primary" id="btn-start" style="min-width:200px">Get Started</button>
    </section>
  `;
  document.getElementById("btn-start").addEventListener("click", handleStart);
  announce("Welcome to Entri AI Career Advisor.");
}

function renderQuestion() {
  const q = getCurrentQuestion();
  if (!q) return;

  prepareStepAnswers();

  const step = state.stepIndex + 1;
  const total = questions.length;
  const pct = Math.round((step / total) * 100);
  const isMulti = q.type === "multi";
  const answer = state.answers[q.id];
  const options = getQuestionOptions(q);
  const maxSelect = getEffectiveMaxSelect(q);
  const subtitle = getQuestionSubtitle(q);
  const selectedMulti = isMulti ? answer : [];
  const atMax = isMulti && selectedMulti.length >= maxSelect;

  const optionsHtml = options
    .map((opt) => {
      const selected = isMulti ? selectedMulti.includes(opt) : answer === opt;
      const disabled = isMulti && atMax && !selected;
      return `
        <button type="button"
          class="option${selected ? " option--selected" : ""}"
          data-option="${escapeHtml(opt)}"
          aria-pressed="${selected}"
          ${disabled ? "disabled" : ""}
        >${escapeHtml(opt)}</button>
      `;
    })
    .join("");

  screenEl.innerHTML = `
    <section class="question">
      <div class="progress" role="group" aria-label="Quiz progress">
        <div class="progress__label">
          <span>Question ${step} of ${total}</span>
          <span>${pct}%</span>
        </div>
        <div class="progress__bar" aria-hidden="true">
          <div class="progress__fill" style="width:${pct}%"></div>
        </div>
      </div>
      <h2 id="question-title">${escapeHtml(q.title)}</h2>
      ${subtitle ? `<p class="question__subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <div class="options" role="${isMulti ? "group" : "radiogroup"}" aria-labelledby="question-title">
        ${optionsHtml}
      </div>
      <div class="actions">
        ${state.stepIndex > 0 ? '<button type="button" class="btn btn--ghost" id="btn-back">Back</button>' : "<span></span>"}
        <button type="button" class="btn btn--primary" id="btn-next" ${isStepValid() ? "" : "disabled"}>
          ${state.stepIndex === total - 1 ? "See My Recommendations" : "Next"}
        </button>
      </div>
    </section>
  `;

  screenEl.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const opt = btn.getAttribute("data-option");
      if (isMulti) toggleMulti(opt, maxSelect);
      else {
        state.answers[q.id] = opt;
        if (q.id === "goal") state.answers.careerType = [];
        render();
      }
    });
  });

  const backBtn = document.getElementById("btn-back");
  if (backBtn) backBtn.addEventListener("click", handleBack);
  document.getElementById("btn-next").addEventListener("click", handleNext);
  announce(`Question ${step} of ${total}: ${q.title}`);
}

function toggleMulti(option, maxSelect) {
  const current = [...state.answers.careerType];
  const idx = current.indexOf(option);
  if (idx >= 0) current.splice(idx, 1);
  else if (current.length < maxSelect) current.push(option);
  state.answers.careerType = current;
  render();
}

function renderLoading() {
  screenEl.innerHTML = `
    <section class="loading">
      <div class="loading__spinner">
        <div class="loading__ring"></div>
        <div class="loading__ring loading__ring--active"></div>
        <div class="loading__emoji">✨</div>
      </div>
      <h2>AI is analyzing your answers</h2>
      <p>Finding your best-fit courses…</p>
      <div class="loading__dots" aria-hidden="true">
        <span class="loading__dot"></span>
        <span class="loading__dot"></span>
        <span class="loading__dot"></span>
      </div>
    </section>
  `;
}

function renderLeadForm() {
  const name = state.lead.name;
  const phone = state.lead.phone;
  const showErrors = state.leadFormAttempted;
  const nameError = showErrors && name.trim().length < 2;
  const phoneError = showErrors && !isValidIndianPhone(normalizePhone(phone));
  const canSubmit = isLeadFormValid() && !state.submitting;

  screenEl.innerHTML = `
    <section class="lead-form">
      <h2>Almost there!</h2>
      <p class="lead-form__subtitle">Enter your details to unlock your personalized career recommendations.</p>

      <form id="lead-form" class="lead-form__fields" novalidate>
        <div class="field">
          <label class="field__label" for="lead-name">Full name</label>
          <input
            type="text"
            id="lead-name"
            class="field__input${nameError ? " field__input--error" : ""}"
            name="name"
            autocomplete="name"
            placeholder="Your name"
            value="${escapeHtml(name)}"
            required
            minlength="2"
          >
          ${nameError ? '<p class="field__error">Please enter at least 2 characters.</p>' : ""}
        </div>

        <div class="field">
          <label class="field__label" for="lead-phone">Phone number</label>
          <input
            type="tel"
            id="lead-phone"
            class="field__input${phoneError ? " field__input--error" : ""}"
            name="phone"
            autocomplete="tel"
            placeholder="10-digit mobile number"
            value="${escapeHtml(phone)}"
            inputmode="numeric"
            maxlength="14"
            required
          >
          ${phoneError ? '<p class="field__error">Enter a valid 10-digit Indian mobile number.</p>' : ""}
        </div>

        <p class="lead-form__note">We’ll use this only to share your career plan and course guidance from Entri.</p>

        <button type="submit" id="lead-submit" class="btn btn--primary" ${canSubmit ? "" : "disabled"}>
          ${state.submitting ? "Saving…" : "View My Recommendations"}
        </button>
      </form>
    </section>
  `;

  const form = document.getElementById("lead-form");
  const submitBtn = document.getElementById("lead-submit");

  document.getElementById("lead-name").addEventListener("input", (e) => {
    state.lead.name = e.target.value;
    if (submitBtn) submitBtn.disabled = !isLeadFormValid() || state.submitting;
  });

  document.getElementById("lead-phone").addEventListener("input", (e) => {
    state.lead.phone = e.target.value;
    if (submitBtn) submitBtn.disabled = !isLeadFormValid() || state.submitting;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLeadSubmit();
  });

  announce("Please enter your name and phone number to see your recommendations.");
}

async function handleLeadSubmit() {
  state.leadFormAttempted = true;
  if (!isLeadFormValid() || state.submitting) {
    renderLeadForm();
    return;
  }

  state.submitting = true;
  renderLeadForm();

  try {
    await submitLeadToSheet();
  } catch (err) {
    console.error("Sheet submit failed:", err);
  }

  state.submitting = false;
  showResults();
}

function renderCourseCard(item, compact) {
  const c = item.course;
  const tags = c.category.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const careers = (c.careerOpportunities || []).slice(0, 3).join(" · ");

  if (compact) {
    return `
      <article class="glass-card course-card">
        <div class="tags">${tags}</div>
        <h3>${escapeHtml(c.title)}</h3>
        <p class="course-card__why"><strong>Why this course suits you:</strong> ${escapeHtml(item.whyFits)}</p>
      </article>
    `;
  }

  return `
    <article class="glass-card course-card">
      <div class="tags">${tags}</div>
      <h3>${escapeHtml(c.title)}</h3>
      <p class="course-card__why"><strong>Why this course suits you:</strong> ${escapeHtml(item.whyFits)}</p>
      <div class="meta-grid">
        <div class="meta-item">
          <p class="meta-item__label">Career Opportunities</p>
          <p class="meta-item__value">${escapeHtml(careers)}</p>
        </div>
        <div class="meta-item">
          <p class="meta-item__label">Difficulty</p>
          <p class="meta-item__value">${escapeHtml(capitalize(c.level))}</p>
        </div>
        <div class="meta-item">
          <p class="meta-item__label">Learning Time</p>
          <p class="meta-item__value">${escapeHtml(formatDuration(c.durationWeeks))}</p>
        </div>
        <div class="meta-item">
          <p class="meta-item__label">Demand · Growth</p>
          <div class="indicators">
            <span class="indicator ${indicatorClass(c.demandIndicator)}">${escapeHtml(c.demandIndicator)} Demand</span>
            <span class="indicator ${indicatorClass(c.futureGrowthIndicator)}">${escapeHtml(c.futureGrowthIndicator)} Growth</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderResults() {
  const r = state.result;
  if (!r) return;

  const isGov = r.isGovernmentTrack && r.governmentPaths?.length;

  const mainListHtml = isGov
    ? r.governmentPaths.map((item) => renderCourseCard(item, false)).join("")
    : r.topPicks.map((item) => renderCourseCard(item, false)).join("");

  const alsoHtml = !isGov && r.alsoLike.length
    ? r.alsoLike.map((item) => renderCourseCard(item, true)).join("")
    : "";

  const resultsTitle = isGov
    ? "Here are the government exam paths for you"
    : "Based on your profile, here are your best career paths";

  const govSectionLabel = isGov
    ? `<p class="results__gov-label">Kerala PSC · KPSC Technical · Banking · SSC · RRB Railways · Teaching exams & more</p>`
    : "";

  screenEl.innerHTML = `
    <section class="results">
      <div class="results__header">
        <span class="results__badge">🎉 Congratulations!</span>
        <h2 id="results-title">${escapeHtml(resultsTitle)}</h2>
        ${govSectionLabel}
        <p class="results__narrative">${escapeHtml(r.profileNarrative)}</p>
      </div>

      <div class="summary-card">
        <h3>Your Career Summary</h3>
        <p>${escapeHtml(r.personalSummary)}</p>
      </div>

      ${isGov ? `<h3 class="section-title">Government Exam & Test Prep Paths</h3>` : ""}
      <div class="course-list">${mainListHtml}</div>

      ${alsoHtml ? `
        <div class="also-like">
          <h3 class="section-title">You may also like</h3>
          <div class="course-list">${alsoHtml}</div>
        </div>
      ` : ""}

      <div class="retake">
        <button type="button" class="link-btn" id="btn-retake">Retake Quiz</button>
      </div>
    </section>
  `;

  document.getElementById("btn-retake").addEventListener("click", handleRetake);

  announce("Your personalized career recommendations are ready.");
}

function render() {
  switch (state.screen) {
    case "welcome": renderWelcome(); break;
    case "question": renderQuestion(); break;
    case "loading": renderLoading(); break;
    case "form": renderLeadForm(); break;
    case "results": renderResults(); break;
    default: renderWelcome();
  }

  mainEl.focus({ preventScroll: true });
}

/* ── Handlers ── */

function handleStart() {
  state.screen = "question";
  state.stepIndex = 0;
  render();
}

function handleNext() {
  if (!isStepValid()) return;
  if (state.stepIndex < questions.length - 1) {
    state.stepIndex += 1;
    render();
    return;
  }
  state.screen = "loading";
  render();
  setTimeout(() => {
    state.result = generateRecommendations(courses, state.answers);
    state.screen = "form";
    render();
  }, 1800);
}

function handleBack() {
  if (state.stepIndex > 0) {
    state.stepIndex -= 1;
    render();
  }
}

function handleRetake() {
  state.screen = "welcome";
  state.stepIndex = 0;
  state.answers = { goal: null, qualification: null, status: null, careerType: [], timeline: null };
  state.lead = { name: "", phone: "" };
  state.leadFormAttempted = false;
  state.result = null;
  state.submitting = false;
  render();
}

function initTheme() {
  const saved = localStorage.getItem("entri-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("entri-theme", next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector(".theme-toggle__icon");
  if (icon) icon.textContent = theme === "light" ? "🌙" : "☀️";
}

async function init() {
  initTheme();
  try {
    const [coursesRes, questionsRes] = await Promise.all([
      fetch("data/courses.json"),
      fetch("data/questions.json"),
    ]);
    if (!coursesRes.ok || !questionsRes.ok) throw new Error("Failed to load data");
    courses = await coursesRes.json();
    questions = await questionsRes.json();
  } catch (err) {
    screenEl.innerHTML = `<p class="error-msg" role="alert">Unable to load quiz data. Please use a local server: <code>npx serve .</code></p>`;
    console.error(err);
    return;
  }
  render();
}

init();
