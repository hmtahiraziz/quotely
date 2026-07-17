import Airtable, { FieldSet, Record as AirtableRecord } from "airtable";
import { randomUUID } from "crypto";
import { config } from "../config";
import type {
  Addon,
  CreateQuoteInput,
  Package,
  PricingCatalog,
  Quote,
  Service,
} from "../types";
import { withRetry } from "../utils/retry";
import { estimateFromBrief } from "./briefEstimate";

const base = new Airtable({ apiKey: config.airtable.apiKey }).base(
  config.airtable.baseId
);

const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
let catalogCache: { data: PricingCatalog; cachedAt: number } | null = null;

function num(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function linkedId(value: unknown): string {
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }
  return str(value);
}

function mapService(record: AirtableRecord<FieldSet>): Service {
  return {
    id: record.id,
    name: str(record.get("Name")),
    description: str(record.get("Description")),
  };
}

function mapPackage(record: AirtableRecord<FieldSet>): Package {
  return {
    id: record.id,
    name: str(record.get("Name")),
    description: str(record.get("Description")),
    price: num(record.get("Price")),
    serviceId: linkedId(record.get("Service")),
  };
}

function mapAddon(record: AirtableRecord<FieldSet>): Addon {
  return {
    id: record.id,
    name: str(record.get("Name")),
    description: str(record.get("Description")),
    price: num(record.get("Price")),
    serviceId: linkedId(record.get("Service")),
  };
}

async function fetchAll<T>(
  tableName: string,
  mapper: (record: AirtableRecord<FieldSet>) => T
): Promise<T[]> {
  const records = await withRetry(`fetch ${tableName}`, () =>
    base(tableName).select().all()
  );
  return records.map(mapper);
}

async function fetchPricingCatalogFresh(): Promise<PricingCatalog> {
  const [services, packages, addons] = await Promise.all([
    fetchAll("Services", mapService),
    fetchAll("Packages", mapPackage),
    fetchAll("Addons", mapAddon),
  ]);

  return { services, packages, addons };
}

export async function getPricingCatalog(): Promise<PricingCatalog> {
  const now = Date.now();
  if (
    catalogCache &&
    now - catalogCache.cachedAt < CATALOG_CACHE_TTL_MS
  ) {
    return catalogCache.data;
  }

  try {
    const data = await fetchPricingCatalogFresh();
    catalogCache = { data, cachedAt: now };
    return data;
  } catch (err) {
    // Serve last good catalog during brief DNS/network blips.
    if (catalogCache) {
      console.warn(
        "[airtable] Serving cached pricing catalog after network failure"
      );
      return catalogCache.data;
    }
    throw err;
  }
}

function parseAddonsJson(value: unknown): Quote["addons"] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as
      | Quote["addons"]
      | {
          addons?: Quote["addons"];
          items?: Quote["addons"];
        };
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        id: str((item as { id?: unknown }).id) || str((item as { addon?: unknown }).addon),
        name:
          str((item as { name?: unknown }).name) ||
          str((item as { addon?: unknown }).addon),
        price: num((item as { price?: unknown }).price),
      }));
    }
    if (parsed && typeof parsed === "object") {
      const list = parsed.addons ?? parsed.items ?? [];
      return Array.isArray(list)
        ? list.map((item) => ({
            id: str(item.id),
            name: str(item.name),
            price: num(item.price),
          }))
        : [];
    }
    return [];
  } catch {
    return [];
  }
}

function parseQuoteMeta(value: unknown): {
  customerEmail?: string;
  createdAt?: string;
  serviceId?: string;
  packageId?: string;
  brief?: Record<string, string>;
  briefEstimate?: Quote["briefEstimate"];
  submittedAt?: string;
} {
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return {};
    }
    const briefRaw = parsed.brief;
    const brief =
      briefRaw && typeof briefRaw === "object" && !Array.isArray(briefRaw)
        ? Object.fromEntries(
            Object.entries(briefRaw as Record<string, unknown>).map(
              ([k, v]) => [k, str(v)]
            )
          )
        : undefined;

    let briefEstimate: Quote["briefEstimate"];
    const est = parsed.briefEstimate;
    if (est && typeof est === "object" && !Array.isArray(est)) {
      const e = est as Record<string, unknown>;
      const rationale = Array.isArray(e.rationale)
        ? e.rationale.map((r) => String(r)).filter(Boolean)
        : [];
      briefEstimate = {
        low: num(e.low),
        high: num(e.high),
        rationale,
        source: "brief",
      };
    }

    return {
      customerEmail: str(parsed.customerEmail) || undefined,
      createdAt: str(parsed.createdAt) || undefined,
      serviceId: str(parsed.serviceId) || undefined,
      packageId: str(parsed.packageId) || undefined,
      brief,
      briefEstimate,
      submittedAt: str(parsed.submittedAt) || undefined,
    };
  } catch {
    return {};
  }
}

function splitCustomerName(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: raw, email: "" };
}

function mapQuote(record: AirtableRecord<FieldSet>): Quote {
  const addonsJson = record.get("AddonsJSON");
  const addons = parseAddonsJson(addonsJson);
  const meta = parseQuoteMeta(addonsJson);
  const packagePrice = num(record.get("PackagePrice"));
  const addonTotal = num(record.get("AddonTotal"));
  const totalPrice = num(record.get("TotalPrice"));
  const rawCustomer = str(record.get("CustomerName"));
  const split = splitCustomerName(rawCustomer);

  return {
    quoteId: str(record.get("QuoteId")) || record.id,
    serviceId: linkedId(record.get("Service")) || meta.serviceId || "",
    serviceName: str(record.get("ServiceName")),
    packageId: linkedId(record.get("Package")) || meta.packageId || "",
    packageName: str(record.get("PackageName")),
    packagePrice,
    addons,
    addonTotal,
    totalPrice,
    customerName: split.name || rawCustomer,
    customerEmail:
      str(record.get("CustomerEmail")) || meta.customerEmail || split.email,
    createdAt:
      str(record.get("CreatedAt")) ||
      meta.createdAt ||
      new Date().toISOString(),
    brief: meta.brief,
    briefEstimate: meta.briefEstimate,
    submittedAt: meta.submittedAt,
  };
}

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  const catalog = await getPricingCatalog();

  const service = catalog.services.find((s) => s.id === input.serviceId);
  if (!service) {
    throw Object.assign(new Error("Invalid serviceId"), { statusCode: 400 });
  }

  const isOtherService = /other/i.test(service.name);
  const customNote = input.customServiceNote?.trim() ?? "";
  if (isOtherService && customNote.length < 8) {
    throw Object.assign(
      new Error("Please describe what you need for a custom request"),
      { statusCode: 400 }
    );
  }

  const serviceName =
    isOtherService && customNote
      ? `${service.name} — ${customNote}`
      : service.name;

  const rawPackageId = input.packageId?.trim() || "";
  const skipPackage =
    !rawPackageId || rawPackageId === "__none__" || rawPackageId === "none";

  let packageId = "";
  let packageName = "No package";
  let packagePrice = 0;
  let briefEstimate: Quote["briefEstimate"];

  if (!skipPackage) {
    const selectedPackage = catalog.packages.find(
      (p) => p.id === rawPackageId && p.serviceId === input.serviceId
    );
    if (!selectedPackage) {
      throw Object.assign(
        new Error("Invalid packageId for the selected service"),
        { statusCode: 400 }
      );
    }
    packageId = selectedPackage.id;
    packageName = selectedPackage.name;
    packagePrice = selectedPackage.price;
  } else {
    const servicePackages = catalog.packages.filter(
      (p) => p.serviceId === input.serviceId
    );
    const estimate = estimateFromBrief({
      serviceName: service.name,
      brief: input.brief,
      packagePrices: servicePackages.map((p) => p.price),
      customServiceNote: customNote,
    });
    packageName = estimate.label;
    packagePrice = estimate.amount;
    briefEstimate = {
      low: estimate.low,
      high: estimate.high,
      rationale: estimate.rationale,
      source: "brief",
    };
  }

  const uniqueAddonIds = [...new Set(input.addonIds)];
  const selectedAddons = uniqueAddonIds.map((addonId) => {
    const addon = catalog.addons.find(
      (a) => a.id === addonId && a.serviceId === input.serviceId
    );
    if (!addon) {
      throw Object.assign(new Error(`Invalid addonId: ${addonId}`), {
        statusCode: 400,
      });
    }
    return { id: addon.id, name: addon.name, price: addon.price };
  });

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = packagePrice + addonTotal;
  const quoteId = randomUUID();
  const createdAt = new Date().toISOString();

  // Quotes table in this base only has denormalized text/number fields
  // (no CustomerEmail / Service / Package / CreatedAt columns).
  const addonsPayload = {
    version: 1,
    addons: selectedAddons,
    customerEmail: input.customerEmail,
    createdAt,
    serviceId: input.serviceId,
    packageId,
    brief: input.brief || {},
    ...(briefEstimate ? { briefEstimate } : {}),
  };

  const created = await withRetry("create Quote", () =>
    base("Quotes").create([
      {
        fields: {
          QuoteId: quoteId,
          ServiceName: serviceName,
          PackageName: packageName,
          PackagePrice: packagePrice,
          AddonsJSON: JSON.stringify(addonsPayload),
          AddonTotal: addonTotal,
          TotalPrice: totalPrice,
          CustomerName: `${input.customerName} <${input.customerEmail}>`,
        },
      },
    ])
  );

  return mapQuote(created[0]);
}

export async function getQuoteById(quoteId: string): Promise<Quote | null> {
  const records = await withRetry("get Quote", () =>
    base("Quotes")
      .select({
        filterByFormula: `{QuoteId} = "${quoteId.replace(/"/g, '\\"')}"`,
        maxRecords: 1,
      })
      .firstPage()
  );

  if (records.length === 0) return null;
  return mapQuote(records[0]);
}

export async function markQuoteSubmitted(quoteId: string): Promise<Quote> {
  const records = await withRetry("find Quote for submit", () =>
    base("Quotes")
      .select({
        filterByFormula: `{QuoteId} = "${quoteId.replace(/"/g, '\\"')}"`,
        maxRecords: 1,
      })
      .firstPage()
  );

  if (records.length === 0) {
    throw Object.assign(new Error("Quote not found"), { statusCode: 404 });
  }

  const record = records[0];
  const raw = record.get("AddonsJSON");
  let payload: Record<string, unknown> = {};
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        payload = parsed;
      }
    } catch {
      payload = {};
    }
  }

  const submittedAt = new Date().toISOString();
  payload.submittedAt = submittedAt;

  const updated = await withRetry("mark Quote submitted", () =>
    base("Quotes").update([
      {
        id: record.id,
        fields: {
          AddonsJSON: JSON.stringify(payload),
        },
      },
    ])
  );

  return mapQuote(updated[0]);
}
