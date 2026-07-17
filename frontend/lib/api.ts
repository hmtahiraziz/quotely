import type { CreateQuotePayload, PricingCatalog, Quote } from "@/types/quote";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = (await res.json().catch(() => null)) as
    | T
    | { error?: { message?: string; statusCode?: number } }
    | null;

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      data.error?.message
        ? data.error.message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  getPricing: () => request<PricingCatalog>("/api/pricing"),

  createQuote: (payload: CreateQuotePayload) =>
    request<Quote>("/api/quotes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getQuote: (quoteId: string) =>
    request<Quote>(`/api/quotes/${encodeURIComponent(quoteId)}`),

  submitQuote: (quoteId: string) =>
    request<{ ok: boolean; alreadySubmitted?: boolean; quote: Quote }>(
      `/api/quotes/${encodeURIComponent(quoteId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    ),
};

export { ApiError };
