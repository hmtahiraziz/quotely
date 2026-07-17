export type BriefFieldType = "text" | "textarea" | "select";

export interface BriefFieldOption {
  label: string;
  value: string;
}

export interface BriefField {
  id: string;
  label: string;
  type: BriefFieldType;
  placeholder?: string;
  required?: boolean;
  options?: BriefFieldOption[];
  helpText?: string;
}

/** Shared discovery fields for every service */
export const CORE_BRIEF_FIELDS: BriefField[] = [
  {
    id: "projectName",
    label: "Project name",
    type: "text",
    placeholder: "Acme marketing site refresh",
    required: true,
  },
  {
    id: "goals",
    label: "Brief summary of project",
    type: "textarea",
    placeholder:
      "e.g. Launch a clearer website that converts demos and explains our product in under 30 seconds.",
    required: true,
    helpText: "Be specific, this becomes the heart of your proposal.",
  },
  {
    id: "timeline",
    label: "Ideal timeline",
    type: "select",
    required: true,
    options: [
      { label: "ASAP / within 2 weeks", value: "asap" },
      { label: "2–4 weeks", value: "2-4-weeks" },
      { label: "1–2 months", value: "1-2-months" },
      { label: "3+ months / flexible", value: "flexible" },
    ],
  },
  {
    id: "budgetRange",
    label: "Budget range (optional)",
    type: "select",
    options: [
      { label: "Prefer not to say", value: "" },
      { label: "Under $2,500", value: "under-2500" },
      { label: "$2,500 – $7,500", value: "2500-7500" },
      { label: "$7,500 – $20,000", value: "7500-20000" },
      { label: "$20,000+", value: "20000-plus" },
    ],
  },
  {
    id: "mustHaves",
    label: "Must-haves",
    type: "textarea",
    placeholder: "Non-negotiable features, pages, or outcomes…",
  },
  {
    id: "niceToHaves",
    label: "Nice-to-haves",
    type: "textarea",
    placeholder: "Things that would be great if budget/time allow…",
  },
  {
    id: "constraints",
    label: "Constraints or existing assets",
    type: "textarea",
    placeholder: "Brand guidelines, tech stack, stakeholders, hard deadlines…",
  },
  {
    id: "references",
    label: "References / competitors / inspiration",
    type: "textarea",
    placeholder: "Links or names of sites, apps, or brands you like…",
  },
  {
    id: "extraNotes",
    label: "Anything else we should know?",
    type: "textarea",
    placeholder: "Add as much detail as you want — more context = a better estimate.",
  },
];

const SERVICE_EXTRA_FIELDS: Array<{ match: RegExp; fields: BriefField[] }> = [
  {
    match: /web design|ui\/ux|graphic|brand/i,
    fields: [
      {
        id: "deliverableFocus",
        label: "Primary deliverable",
        type: "select",
        options: [
          { label: "Marketing / brochure site", value: "marketing-site" },
          { label: "Landing page / campaign", value: "landing" },
          { label: "Product / app UI", value: "product-ui" },
          { label: "Brand / visual identity", value: "brand" },
          { label: "Something else", value: "other" },
        ],
      },
      {
        id: "pageOrScreenCount",
        label: "Approx. pages or key screens",
        type: "select",
        options: [
          { label: "1–3", value: "1-3" },
          { label: "4–8", value: "4-8" },
          { label: "9–15", value: "9-15" },
          { label: "16+", value: "16-plus" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
      {
        id: "hasExistingBrand",
        label: "Do you have existing brand guidelines?",
        type: "select",
        options: [
          { label: "Yes — solid guidelines", value: "yes" },
          { label: "Partial / outdated", value: "partial" },
          { label: "No — starting fresh", value: "no" },
        ],
      },
    ],
  },
  {
    match: /web development|app development|shopify|wordpress|e-commerce|devops/i,
    fields: [
      {
        id: "platforms",
        label: "Platforms / stack preference",
        type: "select",
        options: [
          { label: "Web only", value: "web" },
          { label: "iOS + Android (or cross-platform)", value: "mobile" },
          { label: "Web + mobile", value: "web-mobile" },
          { label: "Shopify / WordPress", value: "cms-commerce" },
          { label: "Open to recommendation", value: "open" },
        ],
      },
      {
        id: "integrations",
        label: "Required integrations",
        type: "textarea",
        placeholder: "Payments, CRM, analytics, SSO, inventory, email tools…",
      },
      {
        id: "existingProductUrl",
        label: "Existing site or product URL (optional)",
        type: "text",
        placeholder: "https://",
      },
    ],
  },
  {
    match: /seo|digital marketing|paid advertising|social media|email marketing|content/i,
    fields: [
      {
        id: "currentChannels",
        label: "Current channels in use",
        type: "textarea",
        placeholder: "Google Ads, LinkedIn, SEO blog, email, none yet…",
      },
      {
        id: "targetAudience",
        label: "Target audience",
        type: "textarea",
        placeholder: "Who are you trying to reach, and where are they?",
      },
      {
        id: "monthlyTrafficOrSpend",
        label: "Current traffic or ad spend (approx.)",
        type: "select",
        options: [
          { label: "Just starting", value: "starting" },
          { label: "Low (learning stage)", value: "low" },
          { label: "Moderate / growing", value: "moderate" },
          { label: "Established / scaling", value: "scaling" },
          { label: "Prefer not to say", value: "private" },
        ],
      },
    ],
  },
  {
    match: /cloud|cyber|it support|qa|data analytics|crm|ai/i,
    fields: [
      {
        id: "currentEnvironment",
        label: "Current environment",
        type: "textarea",
        placeholder: "Cloud provider, tools, team size, pain points…",
      },
      {
        id: "complianceNeeds",
        label: "Compliance or security needs",
        type: "select",
        options: [
          { label: "None specific", value: "none" },
          { label: "SOC 2 / ISO interest", value: "soc2" },
          { label: "HIPAA / healthcare", value: "hipaa" },
          { label: "GDPR / privacy-heavy", value: "gdpr" },
          { label: "Other / not sure", value: "other" },
        ],
      },
    ],
  },
  {
    match: /other|custom/i,
    fields: [
      {
        id: "customScope",
        label: "Describe the custom work in detail",
        type: "textarea",
        required: true,
        placeholder:
          "What do you need built or delivered? Include users, outcomes, and constraints.",
      },
    ],
  },
];

export function getBriefFieldsForService(serviceName: string | null | undefined): BriefField[] {
  const extras =
    SERVICE_EXTRA_FIELDS.find((entry) => entry.match.test(serviceName || ""))
      ?.fields ?? [];
  return [...CORE_BRIEF_FIELDS, ...extras];
}

export type BriefAnswers = Record<string, string>;

export function isBriefComplete(
  fields: BriefField[],
  answers: BriefAnswers
): boolean {
  return fields
    .filter((f) => f.required)
    .every((f) => (answers[f.id] || "").trim().length >= (f.type === "textarea" ? 8 : 1));
}

export function briefEntriesForDisplay(
  fields: BriefField[],
  answers: BriefAnswers
): Array<{ label: string; value: string }> {
  return fields
    .map((field) => {
      const raw = (answers[field.id] || "").trim();
      if (!raw) return null;
      let value = raw;
      if (field.type === "select" && field.options) {
        value = field.options.find((o) => o.value === raw)?.label || raw;
      }
      return { label: field.label, value };
    })
    .filter((x): x is { label: string; value: string } => Boolean(x));
}
