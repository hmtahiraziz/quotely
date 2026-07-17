/**
 * Heuristic project estimate from the client brief + service.
 * Used when no catalog package is selected (and optionally blended with add-ons).
 */

export type BriefAnswers = Record<string, string>;

export interface BriefEstimateInput {
  serviceName: string;
  brief?: BriefAnswers;
  /** Catalog package prices for this service — used as market baseline */
  packagePrices?: number[];
  customServiceNote?: string;
}

export interface BriefEstimateResult {
  amount: number;
  low: number;
  high: number;
  label: string;
  rationale: string[];
  source: "brief";
}

const SERVICE_BASELINES: Array<{ match: RegExp; base: number }> = [
  { match: /app development/i, base: 28000 },
  { match: /web development/i, base: 9000 },
  { match: /web design|ui\/ux/i, base: 4500 },
  { match: /brand identity|graphic/i, base: 3200 },
  { match: /e-?commerce|shopify/i, base: 7500 },
  { match: /wordpress/i, base: 4500 },
  { match: /digital marketing|paid advertising|seo/i, base: 4500 },
  { match: /content writing|social media|email marketing/i, base: 2800 },
  { match: /video production/i, base: 6500 },
  { match: /photography/i, base: 2200 },
  { match: /cloud|devops|cyber|qa/i, base: 7500 },
  { match: /data analytics|crm|ai & automation/i, base: 5500 },
  { match: /product consulting|business consulting/i, base: 5500 },
  { match: /it support|training|translation|virtual assistant/i, base: 1800 },
  { match: /other|custom/i, base: 4000 },
];

const BUDGET_MID: Record<string, { mid: number; low: number; high: number }> = {
  "under-2500": { mid: 1800, low: 800, high: 2500 },
  "2500-7500": { mid: 4500, low: 2500, high: 7500 },
  "7500-20000": { mid: 12000, low: 7500, high: 20000 },
  "20000-plus": { mid: 28000, low: 20000, high: 60000 },
};

const COMPLEXITY_KEYWORDS: Array<{ pattern: RegExp; weight: number; note: string }> = [
  {
    pattern: /\b(enterprise|multi-?tenant|soc\s*2|compliance)\b/i,
    weight: 0.28,
    note: "Enterprise / compliance complexity",
  },
  {
    pattern: /\b(e-?commerce|checkout|payments?|subscriptions?|shopify)\b/i,
    weight: 0.2,
    note: "Commerce / payments complexity",
  },
  {
    pattern: /\b(integrations?|api|webhook|sso|oauth|crm|erp)\b/i,
    weight: 0.18,
    note: "Integrations called out",
  },
  {
    pattern: /\b(dashboard|admin|portal|auth(entication)?|roles?)\b/i,
    weight: 0.15,
    note: "Product / auth workflows",
  },
  {
    pattern: /\b(mobile app|ios|android|react native|flutter)\b/i,
    weight: 0.22,
    note: "Mobile delivery",
  },
  {
    pattern: /\b(ai|ml|llm|automation|chatbot)\b/i,
    weight: 0.16,
    note: "AI / automation scope",
  },
  {
    pattern: /\b(multi-?(language|lingual|region|brand)|localization|i18n)\b/i,
    weight: 0.12,
    note: "Multi-market / localization",
  },
  {
    pattern: /\b(redesign|rebuild|migration|legacy)\b/i,
    weight: 0.12,
    note: "Rebuild / migration effort",
  },
];

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function roundTo(n: number, step = 100): number {
  return Math.max(step, Math.round(n / step) * step);
}

function serviceBaseline(serviceName: string, packagePrices?: number[]): number {
  const fromCatalog = median((packagePrices || []).filter((n) => n > 0));
  if (fromCatalog) return fromCatalog;

  for (const row of SERVICE_BASELINES) {
    if (row.match.test(serviceName)) return row.base;
  }
  return 4000;
}

function collectText(brief: BriefAnswers = {}, customNote = ""): string {
  return [
    brief.projectName,
    brief.goals,
    brief.mustHaves,
    brief.niceToHaves,
    brief.constraints,
    brief.references,
    brief.extraNotes,
    brief.deliverableFocus,
    brief.platform,
    customNote,
  ]
    .filter(Boolean)
    .join("\n");
}

export function estimateFromBrief(
  input: BriefEstimateInput
): BriefEstimateResult {
  const brief = input.brief || {};
  const rationale: string[] = [];
  const text = collectText(brief, input.customServiceNote);
  const textLen = text.trim().length;

  let amount = serviceBaseline(input.serviceName, input.packagePrices);
  rationale.push(
    `Baseline for ${input.serviceName.replace(/\s*—.*$/, "").trim()}`
  );

  let multiplier = 1;

  if (textLen >= 120) {
    multiplier += 0.08;
    rationale.push("Solid project summary provided");
  }
  if (textLen >= 320) {
    multiplier += 0.12;
    rationale.push("Detailed brief increases scoped effort");
  }
  if (textLen >= 700) {
    multiplier += 0.1;
  }

  if ((brief.mustHaves || "").trim().length >= 40) {
    multiplier += 0.1;
    rationale.push("Must-haves expand delivery scope");
  }
  if ((brief.niceToHaves || "").trim().length >= 40) {
    multiplier += 0.05;
  }
  if ((brief.constraints || "").trim().length >= 40) {
    multiplier += 0.06;
    rationale.push("Constraints / existing systems factored in");
  }

  for (const rule of COMPLEXITY_KEYWORDS) {
    if (rule.pattern.test(text)) {
      multiplier += rule.weight;
      rationale.push(rule.note);
    }
  }

  const timeline = (brief.timeline || "").toLowerCase();
  if (timeline === "asap") {
    multiplier += 0.18;
    rationale.push("Rush / ASAP timeline premium");
  } else if (timeline === "2-4-weeks") {
    multiplier += 0.08;
    rationale.push("Compressed 2–4 week timeline");
  } else if (timeline === "flexible") {
    multiplier -= 0.05;
    rationale.push("Flexible timeline");
  }

  const focus = (brief.deliverableFocus || "").toLowerCase();
  if (/full|system|platform|suite|program/.test(focus)) {
    multiplier += 0.12;
  } else if (/landing|logo|audit|starter/.test(focus)) {
    multiplier -= 0.08;
  }

  amount = roundTo(amount * multiplier);

  const budget = BUDGET_MID[brief.budgetRange || ""];
  if (budget) {
    // Blend toward stated budget band, then clamp inside it.
    amount = roundTo(amount * 0.35 + budget.mid * 0.65);
    amount = Math.min(budget.high, Math.max(budget.low, amount));
    rationale.push("Aligned to your stated budget range");
  }

  const spread = budget
    ? Math.max(400, Math.round((budget.high - budget.low) * 0.15))
    : Math.max(500, Math.round(amount * 0.18));

  const low = roundTo(Math.max(500, amount - spread));
  const high = roundTo(amount + spread);

  return {
    amount,
    low,
    high,
    label: "Scope estimate (from brief)",
    rationale: rationale.slice(0, 5),
    source: "brief",
  };
}
