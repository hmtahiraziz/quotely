"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PricingCatalog } from "@/types/quote";
import { QuoteWizard } from "@/components/QuoteWizard";
import { TopNav } from "@/components/TopNav";

export default function QuotePage() {
  const [catalog, setCatalog] = useState<PricingCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api.getPricing();
        if (!cancelled) setCatalog(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load pricing. Is the API running?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav variant="app" />
        <p className="px-10 py-16 text-body-md text-on-surface-variant">
          Loading your catalog…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav variant="app" />
        <div className="mx-auto max-w-canvas px-4 py-16 sm:px-10">
          <div className="rounded-xl border border-error/30 bg-error-container p-6 text-sm text-error">
            <p className="font-semibold">Couldn&apos;t load pricing</p>
            <p className="mt-1">{error}</p>
            <p className="mt-3 opacity-80">
              Make sure the backend is running on port 4000 and Airtable is
              configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!catalog) return null;

  return <QuoteWizard catalog={catalog} />;
}
