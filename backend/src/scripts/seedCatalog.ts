/**
 * Reseeds Services, Packages, and Addons with a full professional catalog.
 * Run: npm run seed:catalog
 *
 * WARNING: Deletes existing rows in Services, Packages, and Addons.
 * Quotes table is left untouched.
 */
import dotenv from "dotenv";
import Airtable from "airtable";

dotenv.config();

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  throw new Error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID are required");
}

const base = new Airtable({ apiKey }).base(baseId);

type Item = { name: string; description: string; price: number };
type CatalogService = {
  name: string;
  description: string;
  packages: Item[];
  addons: Item[];
};

function pkgs(
  a: [string, string, number],
  b: [string, string, number],
  c: [string, string, number]
): Item[] {
  return [
    { name: a[0], description: a[1], price: a[2] },
    { name: b[0], description: b[1], price: b[2] },
    { name: c[0], description: c[1], price: c[2] },
  ];
}

function adds(
  ...items: Array<[string, string, number]>
): Item[] {
  return items.map(([name, description, price]) => ({
    name,
    description,
    price,
  }));
}

const CATALOG: CatalogService[] = [
  {
    name: "Web Design",
    description:
      "Responsive website design with clear information architecture and conversion-focused layouts.",
    packages: pkgs(
      ["Landing Page", "Single high-converting landing page for desktop and mobile.", 1800],
      ["Marketing Website", "Multi-page marketing site (up to 8 pages) with key conversion paths.", 4800],
      ["Product Experience", "End-to-end product UI design with flows and interactive prototypes.", 9500]
    ),
    addons: adds(
      ["Design System Starter", "Color, type, and component tokens for engineering handoff.", 900],
      ["Accessibility Audit", "WCAG-oriented review with prioritized remediation recommendations.", 800],
      ["Motion Prototype", "Micro-interaction prototypes for primary user journeys.", 1200],
      ["Extra Page Designs", "Three additional custom page layouts beyond package scope.", 1100]
    ),
  },
  {
    name: "Web Development",
    description:
      "Production-ready website engineering with modern frameworks, CMS, and performance best practices.",
    packages: pkgs(
      ["Brochure Site Build", "Static or CMS marketing site from approved designs.", 3200],
      ["Custom Web Application", "Authenticated web app with core business workflows.", 11000],
      ["Platform Rebuild", "Full rebuild of an existing web property with migration support.", 24000]
    ),
    addons: adds(
      ["CMS Integration", "Editable content model and editor training for your team.", 1800],
      ["Performance Pass", "Core Web Vitals optimization and caching strategy.", 1100],
      ["SEO Technical Setup", "Sitemap, meta, redirects, and analytics instrumentation.", 900],
      ["Staging & CI Pipeline", "Preview environments and automated deploy pipeline.", 1600]
    ),
  },
  {
    name: "UI/UX Design",
    description:
      "User research, wireframes, and interface design that reduces friction and improves conversion.",
    packages: pkgs(
      ["UX Audit", "Heuristic review and usability findings with a prioritized backlog.", 2200],
      ["Flow Redesign", "Redesign of a critical user journey with prototype validation.", 5500],
      ["Full UX Program", "Research, IA, wireframes, UI, and usability testing for a product area.", 12000]
    ),
    addons: adds(
      ["User Interviews", "Five moderated interviews with synthesis and opportunity map.", 1600],
      ["Usability Testing", "Remote moderated tests with task success and friction report.", 1800],
      ["Design Ops Handoff", "Annotated specs, assets, and developer walkthrough.", 900],
      ["Persona Workshop", "Stakeholder workshop to define priority personas and jobs-to-be-done.", 1200]
    ),
  },
  {
    name: "App Development",
    description:
      "Custom mobile and cross-platform application development from MVP to production scale.",
    packages: pkgs(
      ["MVP Build", "Core features for initial launch with auth and primary workflows.", 14000],
      ["Growth Platform", "Expanded features, integrations, and production hardening.", 32000],
      ["Enterprise Delivery", "Complex multi-team delivery with security controls and SLA support.", 65000]
    ),
    addons: adds(
      ["Admin Dashboard", "Internal operations dashboard for users and key metrics.", 4500],
      ["API Documentation", "OpenAPI docs and example requests for partners or clients.", 1200],
      ["Automated Test Suite", "Critical-path automated tests for auth and core flows.", 3200],
      ["Push Notifications", "Transactional and engagement notification infrastructure.", 2200]
    ),
  },
  {
    name: "Brand Identity",
    description:
      "Strategic branding and visual identity systems for startups and growing companies.",
    packages: pkgs(
      ["Logo Suite", "Primary and secondary marks with export-ready brand files.", 1200],
      ["Brand Identity Kit", "Logo, typography, color palette, and core brand applications.", 3800],
      ["Complete Brand System", "Full visual language, guidelines, templates, and asset library.", 7500]
    ),
    addons: adds(
      ["Social Media Kit", "Profile imagery and post templates for major platforms.", 800],
      ["Pitch Deck Template", "Branded presentation template for sales or fundraising.", 1100],
      ["Brand Guidelines PDF", "Shareable brand book with usage rules and examples.", 900],
      ["Custom Icon Set", "24-icon family aligned to your brand geometry.", 1200]
    ),
  },
  {
    name: "Graphic Design",
    description:
      "Marketing and sales creative for campaigns, print, and digital channels.",
    packages: pkgs(
      ["Campaign Creative Pack", "Core campaign visuals for ads, web, and social.", 1500],
      ["Sales Collateral Suite", "Brochures, one-pagers, and leave-behinds for sales teams.", 3200],
      ["Always-On Creative Retainer", "Monthly creative production for campaigns and campaigns ops.", 5500]
    ),
    addons: adds(
      ["Print Production Files", "Press-ready files with bleed, crop, and color specs.", 500],
      ["Illustration Set", "Custom illustration pack for campaign storytelling.", 1600],
      ["Presentation Design", "Designed slide deck from your outline and content.", 1100],
      ["Packaging Concepts", "Concept directions for product packaging or unboxing.", 2200]
    ),
  },
  {
    name: "Digital Marketing",
    description:
      "Campaign strategy and execution across paid media, lifecycle, and conversion optimization.",
    packages: pkgs(
      ["Campaign Launch", "Strategy, tracking setup, and first 30 days of campaign management.", 2500],
      ["Growth Retainer", "Multi-channel optimization and reporting for one quarter.", 6500],
      ["Full-Funnel Program", "Acquisition, nurture, retention, and attribution program.", 12000]
    ),
    addons: adds(
      ["Ad Creative Pack", "Twelve paid-social and display creative variants.", 1200],
      ["Landing Page CRO", "Conversion audit and A/B test plan for primary landing pages.", 1600],
      ["Email Nurture Sequence", "Five-email nurture sequence with automation map.", 1400],
      ["Analytics Dashboard", "Executive dashboard across ads, web, and pipeline.", 1800]
    ),
  },
  {
    name: "SEO Optimization",
    description:
      "Technical SEO, content strategy, and authority building for sustainable organic growth.",
    packages: pkgs(
      ["Technical Audit", "Crawl, indexation, and Core Web Vitals assessment with fix list.", 1500],
      ["Local SEO Program", "Local pack optimization and location page strategy.", 3200],
      ["Enterprise SEO Sprint", "Sitewide remediation roadmap and 90-day execution plan.", 8500]
    ),
    addons: adds(
      ["Content Brief Pack", "Ten SEO briefs with keywords, outline, and competitor gaps.", 1100],
      ["Schema Markup Setup", "Structured data for services, FAQs, and articles.", 900],
      ["Digital PR Outreach", "Editorial outreach for high-quality mentions and backlinks.", 2400],
      ["Monthly SEO Reporting", "Three months of ranking and opportunity reporting.", 1200]
    ),
  },
  {
    name: "Content Writing",
    description:
      "Professional content for websites, blogs, thought leadership, and demand generation.",
    packages: pkgs(
      ["Website Copy Pack", "Homepage and core service page messaging with SEO alignment.", 1600],
      ["Content Engine", "Eight long-form articles with briefs, drafts, and edits.", 3800],
      ["Thought Leadership Program", "Executive content program with interviews and distribution plan.", 6500]
    ),
    addons: adds(
      ["Case Study Writing", "Customer story with narrative, metrics, and quote capture.", 800],
      ["Editorial Calendar", "90-day content calendar mapped to funnel stages.", 600],
      ["Copy Editing Pass", "Line edit and style polish for existing drafts.", 450],
      ["Whitepaper Draft", "Long-form gated asset with research synthesis.", 1800]
    ),
  },
  {
    name: "Social Media Management",
    description:
      "Channel strategy, content production, community management, and performance reporting.",
    packages: pkgs(
      ["Channel Setup", "Profile optimization, content pillars, and posting playbook.", 1200],
      ["Managed Social", "Monthly content, scheduling, and engagement for two channels.", 2800],
      ["Brand Social Program", "Multi-channel strategy, production, and community ops.", 5500]
    ),
    addons: adds(
      ["Short-Form Video Pack", "Eight short-form videos optimized for Reels/TikTok/Shorts.", 1400],
      ["Community Playbook", "Response guidelines, escalation paths, and tone rules.", 600],
      ["Influencer Outreach", "Creator shortlist and outreach for a campaign burst.", 1800],
      ["Social Listening Report", "Competitor and category conversation analysis.", 900]
    ),
  },
  {
    name: "Email Marketing",
    description:
      "Lifecycle email strategy, creative, automation, and deliverability improvement.",
    packages: pkgs(
      ["Welcome Flow", "Onboarding email sequence with segmentation and testing plan.", 1200],
      ["Lifecycle Program", "Core lifecycle flows: welcome, nurture, win-back, and promo.", 3500],
      ["ESP Migration", "Platform migration, template rebuild, and deliverability baseline.", 6500]
    ),
    addons: adds(
      ["Template Design System", "Reusable email modules aligned to brand.", 1100],
      ["Deliverability Audit", "Auth, list hygiene, and inbox placement recommendations.", 800],
      ["A/B Testing Sprint", "Four structured experiments with learnings report.", 900],
      ["CRM Sync Setup", "Audience sync and event tracking between CRM and ESP.", 1200]
    ),
  },
  {
    name: "Paid Advertising",
    description:
      "Media planning and management across search, social, and display with clear ROI tracking.",
    packages: pkgs(
      ["Search Launch", "Google/Microsoft Ads setup, conversion tracking, and first campaign wave.", 1800],
      ["Paid Social + Search", "Cross-channel acquisition with weekly optimization.", 4800],
      ["Performance Marketing Program", "Full paid media program with creative testing and reporting.", 9500]
    ),
    addons: adds(
      ["Conversion Tracking Audit", "Pixel/tag validation and attribution hygiene check.", 700],
      ["Creative Testing Framework", "Structured creative matrix and learning agenda.", 1000],
      ["Landing Page Variants", "Two campaign-specific landing page variants.", 1600],
      ["Budget Reallocation Model", "Channel mix model based on efficiency and capacity.", 1200]
    ),
  },
  {
    name: "Video Production",
    description:
      "Concept, filming, and editing for promotional, product, and training video content.",
    packages: pkgs(
      ["Product Explainer", "60–90s explainer with script, edit, and motion graphics.", 2800],
      ["Brand Film", "Short brand film with on-site production and color grade.", 7500],
      ["Content Video Series", "Four-episode series for web, social, or training use.", 12000]
    ),
    addons: adds(
      ["Scriptwriting", "Professional script with messaging framework and VO notes.", 600],
      ["Motion Graphics Pack", "Animated lower-thirds, titles, and end cards.", 1100],
      ["Subtitles & Captions", "Burned-in and sidecar captions for accessibility.", 350],
      ["Extra Shoot Day", "Additional production day with crew and basic lighting.", 1800]
    ),
  },
  {
    name: "Photography",
    description:
      "Professional photography for products, events, teams, and brand campaigns.",
    packages: pkgs(
      ["Product Shoot", "Studio or on-location product photography with retouched selects.", 1200],
      ["Brand Lifestyle Shoot", "Directed lifestyle session for campaigns and website.", 2800],
      ["Event Coverage", "Full-day event photography with next-day highlight selects.", 2200]
    ),
    addons: adds(
      ["Advanced Retouching", "High-end retouching for hero campaign imagery.", 600],
      ["Same-Day Selects", "Curated same-day gallery for social or press use.", 400],
      ["Usage Licensing Expansion", "Extended commercial usage rights for campaigns.", 800],
      ["Behind-the-Scenes Package", "BTS stills and short clips for social storytelling.", 500]
    ),
  },
  {
    name: "E-commerce Solutions",
    description:
      "Online store setup, merchandising workflows, payments, and conversion optimization.",
    packages: pkgs(
      ["Store Launch", "Storefront setup, payments, shipping rules, and core templates.", 3800],
      ["Conversion Rebuild", "Theme/UX rebuild focused on PDP, cart, and checkout.", 8500],
      ["Omnichannel Commerce", "Advanced catalog, inventory sync, and multi-channel ops.", 18000]
    ),
    addons: adds(
      ["Payment Gateway Setup", "Gateway configuration, testing, and fail-state handling.", 600],
      ["Subscription Commerce", "Recurring products, billing logic, and customer portal.", 2200],
      ["Product Data Migration", "Catalog import, cleanup, and variant mapping.", 1200],
      ["Checkout CRO Sprint", "Checkout friction audit with experiment backlog.", 1400]
    ),
  },
  {
    name: "Shopify Development",
    description:
      "Shopify theme development, custom apps, and storefront performance improvements.",
    packages: pkgs(
      ["Theme Customization", "Theme setup and customization for brand and merchandising needs.", 2800],
      ["Custom Storefront Build", "Bespoke Shopify theme with advanced sections and apps.", 7500],
      ["Headless Shopify", "Headless storefront with Storefront API and custom UX.", 16000]
    ),
    addons: adds(
      ["App Integration Pack", "Install and configure key Shopify apps with QA.", 900],
      ["Metafield Architecture", "Structured metafields for merchandising and SEO.", 800],
      ["Store Speed Optimization", "Theme and asset performance improvements.", 1100],
      ["Wholesale / B2B Setup", "Customer tags, price lists, and wholesale experience.", 1800]
    ),
  },
  {
    name: "WordPress Development",
    description:
      "WordPress sites, custom themes, Gutenberg blocks, and maintainable CMS architecture.",
    packages: pkgs(
      ["Brochure WordPress Site", "Theme build with editable pages and essential plugins.", 2500],
      ["Custom Theme + Blocks", "Custom theme with reusable Gutenberg block library.", 5500],
      ["Enterprise WordPress", "Multisite or complex content architecture with governance.", 12000]
    ),
    addons: adds(
      ["Editor Training", "Hands-on CMS training session for content owners.", 450],
      ["Security Hardening", "Hardening, backups, and monitoring baseline.", 700],
      ["Migration from Legacy CMS", "Content and URL migration with redirect map.", 1600],
      ["Membership / Gating", "Member areas, gated content, and access rules.", 1800]
    ),
  },
  {
    name: "Cloud Solutions",
    description:
      "Cloud architecture, migration, and managed foundations for reliable operations.",
    packages: pkgs(
      ["Cloud Assessment", "Current-state review, target architecture, and cost model.", 3200],
      ["Migration Delivery", "Workload migration with staging validation and cutover support.", 11000],
      ["Managed Cloud Foundation", "Landing zone with monitoring, IAM baselines, and runbooks.", 22000]
    ),
    addons: adds(
      ["Security Hardening", "Identity, network, logging, and secrets baseline.", 3200],
      ["Cost Optimization Review", "Rightsizing and savings recommendations.", 1400],
      ["Disaster Recovery Plan", "RTO/RPO definition and tested recovery runbook.", 3800],
      ["Team Enablement Workshop", "Half-day architecture and ownership workshop.", 1200]
    ),
  },
  {
    name: "Cybersecurity Consulting",
    description:
      "Security assessments, risk analysis, and practical controls for growing organizations.",
    packages: pkgs(
      ["Security Assessment", "Controls review with risk-ranked findings and roadmap.", 3800],
      ["Penetration Testing", "Scoped application or network testing with remediation guidance.", 8500],
      ["Security Program Build", "Policy, process, and control framework for ongoing security ops.", 16000]
    ),
    addons: adds(
      ["Phishing Simulation", "Campaign and awareness report for employee readiness.", 1100],
      ["Incident Response Playbook", "Roles, severity matrix, and response procedures.", 1400],
      ["Vendor Risk Review", "Assessment of critical SaaS vendors and data flows.", 1200],
      ["Security Awareness Training", "Team training session with practical scenarios.", 900]
    ),
  },
  {
    name: "IT Support",
    description:
      "Business IT support covering endpoints, identity, troubleshooting, and uptime.",
    packages: pkgs(
      ["Helpdesk Starter", "Ticketed support coverage for core tools and endpoints.", 1200],
      ["Managed Workplace", "Device, identity, and application support for growing teams.", 3200],
      ["Business IT Operations", "Broader ops coverage with monitoring and escalation paths.", 6500]
    ),
    addons: adds(
      ["Onboarding / Offboarding Kit", "Standardized joiner-mover-leaver checklists and automation.", 800],
      ["Backup Verification", "Backup configuration review and restore test.", 600],
      ["Network Health Check", "Office network review with remediation recommendations.", 900],
      ["Priority Response SLA", "Faster response window for critical incidents.", 1100]
    ),
  },
  {
    name: "DevOps & CI/CD",
    description:
      "Pipeline automation, infrastructure as code, and reliable release practices.",
    packages: pkgs(
      ["Pipeline Setup", "CI/CD for one primary application with environments and checks.", 3200],
      ["Platform Automation", "IaC, environments, and release automation for your stack.", 7500],
      ["Delivery Excellence Program", "Observability, progressive delivery, and ops maturity uplift.", 14000]
    ),
    addons: adds(
      ["Infrastructure as Code", "Terraform/Pulumi baseline for core environments.", 2200],
      ["Observability Stack", "Logging, metrics, and alerting for key services.", 1800],
      ["Secret Management", "Centralized secrets with rotation guidance.", 1100],
      ["Release Runbook", "Documented release and rollback procedures.", 600]
    ),
  },
  {
    name: "QA & Testing",
    description:
      "Manual and automated quality assurance for web and mobile products.",
    packages: pkgs(
      ["Release QA Sprint", "Manual regression and exploratory testing for a release.", 1800],
      ["Automation Foundation", "Automated smoke and regression suite for critical paths.", 4800],
      ["Quality Program", "Test strategy, automation, and ongoing release quality ops.", 9500]
    ),
    addons: adds(
      ["Test Plan & Cases", "Documented test plan with prioritized cases.", 700],
      ["Cross-Browser Matrix", "Coverage across major browsers and devices.", 900],
      ["API Test Suite", "Automated API contract and regression tests.", 1400],
      ["Accessibility Testing", "Assistive-tech checks on key user journeys.", 1100]
    ),
  },
  {
    name: "Data Analytics",
    description:
      "Measurement strategy, dashboards, and insights that connect activity to business outcomes.",
    packages: pkgs(
      ["Analytics Foundation", "Tracking plan, implementation review, and core dashboards.", 2500],
      ["BI Dashboard Suite", "Executive and operational dashboards with trusted definitions.", 5500],
      ["Insights Program", "Ongoing analysis, experimentation support, and monthly readout.", 11000]
    ),
    addons: adds(
      ["Event Taxonomy Design", "Clean event naming and property standards.", 900],
      ["Attribution Model Review", "Channel attribution review with recommendations.", 1200],
      ["SQL / Warehouse Setup", "Lightweight warehouse model for reporting tables.", 2200],
      ["Experimentation Framework", "A/B testing process, guardrails, and reporting.", 1400]
    ),
  },
  {
    name: "CRM Implementation",
    description:
      "CRM setup, pipeline design, automation, and adoption support for revenue teams.",
    packages: pkgs(
      ["CRM Launch", "Pipeline, fields, permissions, and core automation setup.", 3200],
      ["Revenue Ops Build", "Lead routing, reporting, and sales process automation.", 7500],
      ["CRM Transformation", "Multi-team CRM redesign with integrations and enablement.", 15000]
    ),
    addons: adds(
      ["Data Migration", "Clean import of accounts, contacts, and deal history.", 1800],
      ["Sales Email Sequences", "Sequenced outreach templates and enrollment rules.", 900],
      ["Integration Pack", "Connect CRM to marketing, billing, or support tools.", 1400],
      ["Team Training", "Role-based training for sales and operations users.", 800]
    ),
  },
  {
    name: "AI & Automation",
    description:
      "Practical AI and workflow automation that reduces manual work and improves throughput.",
    packages: pkgs(
      ["Automation Sprint", "Map and automate 2–3 high-ROI internal workflows.", 2800],
      ["AI Assistant Pilot", "Scoped AI assistant for a defined internal or customer use case.", 6500],
      ["Ops Automation Program", "Multi-process automation with governance and monitoring.", 12000]
    ),
    addons: adds(
      ["Process Discovery Workshop", "Workshop to identify automation candidates and ROI.", 1100],
      ["Knowledge Base Ingestion", "Prepare and structure content for AI retrieval.", 1400],
      ["Human-in-the-Loop Controls", "Approval steps, audit logs, and escalation paths.", 1200],
      ["Integration Connectors", "Connect automation flows to your existing SaaS stack.", 1600]
    ),
  },
  {
    name: "Product Consulting",
    description:
      "Product strategy, roadmap facilitation, and delivery coaching for product teams.",
    packages: pkgs(
      ["Product Discovery", "Problem framing, opportunity assessment, and MVP definition.", 3200],
      ["Roadmap Intensive", "Prioritization framework and 2–3 quarter roadmap.", 5500],
      ["Product Operating System", "Cadence, rituals, metrics, and delivery coaching.", 9800]
    ),
    addons: adds(
      ["Stakeholder Interviews", "Structured interviews with synthesis for alignment.", 1200],
      ["Metrics Framework", "North-star and supporting metrics definition.", 900],
      ["Competitive Teardown", "Feature and positioning teardown of key competitors.", 1100],
      ["Launch Readiness Review", "Go-to-market checklist and risk review.", 800]
    ),
  },
  {
    name: "Business Consulting",
    description:
      "Operating model, go-to-market, and growth advisory for ambitious teams.",
    packages: pkgs(
      ["Strategy Sprint", "Focused strategy engagement with clear decisions and owners.", 3800],
      ["Go-to-Market Plan", "ICP, offer, channel, and messaging plan for growth.", 6500],
      ["Operating Model Redesign", "Roles, rituals, and process design for scale.", 12000]
    ),
    addons: adds(
      ["Financial Model Review", "Unit economics and scenario review with recommendations.", 1400],
      ["Pricing Workshop", "Offer packaging and pricing experiment design.", 1200],
      ["Org Design Session", "Role clarity and team structure recommendations.", 1100],
      ["Executive Offsite Facilitation", "Facilitated offsite with decisions and action plan.", 1800]
    ),
  },
  {
    name: "Training & Workshops",
    description:
      "Hands-on enablement for teams adopting new tools, processes, or capabilities.",
    packages: pkgs(
      ["Half-Day Workshop", "Focused enablement session with exercises and takeaways.", 1200],
      ["Team Enablement Series", "Three-session series with practice and office hours.", 3200],
      ["Curriculum Build", "Custom curriculum, materials, and train-the-trainer package.", 6500]
    ),
    addons: adds(
      ["Recording & Replay Pack", "Edited recordings and reusable learning assets.", 450],
      ["Workbook & Templates", "Practical templates for day-to-day application.", 600],
      ["Office Hours Block", "Follow-up coaching block after the workshop.", 700],
      ["Assessment & Certificate", "Skills check and completion certificate.", 500]
    ),
  },
  {
    name: "Translation & Localization",
    description:
      "Professional translation and localization for products, websites, and marketing.",
    packages: pkgs(
      ["Document Translation", "Professional translation for core business documents.", 800],
      ["Website Localization", "Localized website content with linguistic QA.", 2800],
      ["Product Localization", "UI strings, help content, and release localization workflow.", 6500]
    ),
    addons: adds(
      ["Linguistic QA Pass", "In-context linguistic review by a second linguist.", 600],
      ["Glossary & Style Guide", "Terminology glossary and tone guidelines per locale.", 700],
      ["SEO Localization", "Localized keyword research and meta localization.", 900],
      ["Urgent Turnaround", "Expedited delivery for time-sensitive content.", 500]
    ),
  },
  {
    name: "Virtual Assistant Support",
    description:
      "Remote administrative and operations support for scheduling, inbox, and coordination.",
    packages: pkgs(
      ["Part-Time Support", "Dedicated remote support hours for recurring admin work.", 800],
      ["Executive Support", "Calendar, inbox, and meeting coordination for leadership.", 1800],
      ["Ops Support Retainer", "Broader ops support across admin, research, and follow-ups.", 3500]
    ),
    addons: adds(
      ["Travel Coordination", "End-to-end travel planning and itinerary management.", 400],
      ["Research Briefs", "Competitor or market research summaries on request.", 450],
      ["CRM Data Hygiene", "Ongoing contact and pipeline data cleanup.", 500],
      ["Meeting Notes & Actions", "Structured notes and action tracking after meetings.", 350]
    ),
  },
  {
    name: "Other / Custom Request",
    description:
      "Can't find an exact match? Choose this and describe what you need — we'll scope a custom engagement.",
    packages: pkgs(
      ["Discovery Workshop", "Structured discovery to clarify scope, outcomes, and estimate.", 1200],
      ["Custom Project", "Fixed-scope custom delivery based on your brief and constraints.", 5000],
      ["Flexible Retainer", "Monthly capacity for evolving needs with clear priorities.", 3500]
    ),
    addons: adds(
      ["Detailed Proposal Workshop", "Working session to refine scope, milestones, and success criteria.", 600],
      ["Rush Timeline", "Accelerated kickoff and compressed delivery schedule.", 1200],
      ["Stakeholder Alignment Session", "Facilitated session to align decision-makers before kickoff.", 800],
      ["Documentation & Handoff Pack", "Extra documentation, SOPs, and knowledge transfer.", 900],
      ["Dedicated Project Manager", "Named PM for coordination, status, and risk tracking.", 1400]
    ),
  },
];

async function deleteAll(tableName: string): Promise<number> {
  const records = await base(tableName).select({ fields: [] }).all();
  const ids = records.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 10) {
    await base(tableName).destroy(ids.slice(i, i + 10));
  }
  return ids.length;
}

async function createInBatches(
  tableName: string,
  rows: Array<{ fields: Record<string, unknown> }>
) {
  const created = [];
  for (let i = 0; i < rows.length; i += 10) {
    const batch = await base(tableName).create(rows.slice(i, i + 10));
    created.push(...batch);
  }
  return created;
}

async function main() {
  console.log("Clearing existing catalog…");
  const deletedAddons = await deleteAll("Addons");
  const deletedPackages = await deleteAll("Packages");
  const deletedServices = await deleteAll("Services");
  console.log(
    `Deleted ${deletedServices} services, ${deletedPackages} packages, ${deletedAddons} addons`
  );

  console.log(`Creating ${CATALOG.length} services…`);
  for (const service of CATALOG) {
    const [serviceRecord] = await base("Services").create([
      {
        fields: {
          Name: service.name,
          Description: service.description,
        },
      },
    ]);

    const serviceId = serviceRecord.id;

    await createInBatches(
      "Packages",
      service.packages.map((pkg) => ({
        fields: {
          Name: pkg.name,
          Description: pkg.description,
          Price: pkg.price,
          Service: [serviceId],
        },
      }))
    );

    await createInBatches(
      "Addons",
      service.addons.map((addon) => ({
        fields: {
          Name: addon.name,
          Description: addon.description,
          Price: addon.price,
          Service: [serviceId],
        },
      }))
    );

    console.log(
      `✓ ${service.name} (${service.packages.length} packages, ${service.addons.length} addons)`
    );
  }

  console.log("\nCatalog seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
