"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Quote } from "@/types/quote";
import {
  briefEntriesForDisplay,
  getBriefFieldsForService,
} from "@/lib/briefFields";
import {
  ProposalPDF,
} from "@/components/ProposalPDF";
import { Button } from "@/components/ui/Button";
import { TopNav } from "@/components/TopNav";
import { useDialog } from "@/components/ui/Dialog";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Renders brief answers with optional **bold** markers. */
function BriefValueDisplay({ value }: { value: string }) {
  const parts = value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return (
            <strong key={index} className="font-semibold text-on-surface">
              {bold[1]}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = typeof params.quoteId === "string" ? params.quoteId : "";
  const { confirm, alert } = useDialog();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quoteId) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await api.getQuote(quoteId);
        if (!cancelled) setQuote(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Quote not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  const briefRows = useMemo(() => {
    if (!quote?.brief) return [];
    const fields = getBriefFieldsForService(quote.serviceName);
    return briefEntriesForDisplay(fields, quote.brief);
  }, [quote]);

  async function handleSubmitProposal() {
    if (!quote || submitting) return;

    const ok = await confirm({
      title: "Submit this proposal?",
      message:
        "We’ll email the proposal details to our team and send you a confirmation that we received it. You’ll be contacted soon.",
      confirmLabel: "Submit proposal",
      cancelLabel: "Not yet",
      tone: "info",
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      const result = await api.submitQuote(quote.quoteId);
      setQuote(result.quote);
      await alert({
        title: result.alreadySubmitted
          ? "Already submitted"
          : "Proposal submitted",
        message: result.alreadySubmitted
          ? "This proposal was already sent. Check your inbox for the confirmation email."
          : `Thanks! We’ve emailed our team and sent a confirmation to ${quote.customerEmail}.`,
        confirmLabel: "Great",
        tone: "success",
      });
      router.push("/");
    } catch (err) {
      await alert({
        title: "Couldn’t submit proposal",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong while sending emails.",
        confirmLabel: "Try again",
        tone: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav variant="app" />
        <p className="px-10 py-16 text-body-md text-on-surface-variant">
          Loading your proposal…
        </p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav variant="app" />
        <div className="mx-auto max-w-canvas px-4 py-16 sm:px-10">
          <div className="rounded-xl border border-error/30 bg-error-container p-6 text-error">
            <h1 className="font-display text-headline-md">
              Proposal unavailable
            </h1>
            <p className="mt-2 text-sm">{error || "Quote not found."}</p>
            <Link href="/quote" className="mt-6 inline-block">
              <Button variant="secondary">Build a new quote</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const projectTitle =
    quote.brief?.projectName?.trim() || `Proposal for ${quote.customerName}`;
  const isSubmitted = Boolean(quote.submittedAt);

  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="app" />

      <main className="mx-auto max-w-canvas px-4 py-10 sm:px-10">
        <div className="overflow-hidden rounded-2xl border border-[rgba(17,24,39,0.05)] bg-surface-container-lowest shadow-card">
          <div className="border-b border-outline-variant/10 px-6 py-8 sm:px-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Project proposal
                </p>
                <h1 className="mt-2 font-display text-display-md tracking-tight text-on-surface">
                  {projectTitle}
                </h1>
                <p className="mt-2 text-body-md text-on-surface-variant">
                  Prepared for {quote.customerName} · {quote.customerEmail}
                </p>
              </div>
              <span
                className={`rounded-md px-3 py-1.5 text-label-sm ${
                  isSubmitted
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {isSubmitted ? "Submitted" : "Ready for Review"}
              </span>
            </div>
            <p className="mt-4 font-mono text-xs text-outline">
              {quote.quoteId} ·{" "}
              {new Date(quote.createdAt).toLocaleDateString()}
              {isSubmitted
                ? ` · Submitted ${new Date(quote.submittedAt!).toLocaleString()}`
                : ""}
            </p>
          </div>

          <div className="space-y-10 px-6 py-8 sm:px-10">
            {briefRows.length > 0 ? (
              <section>
                <h2 className="mb-4 font-display text-headline-md text-on-surface">
                  Project understanding
                </h2>
                <dl className="space-y-4">
                  {briefRows.map((row) => (
                    <div
                      key={row.label}
                      className="border-b border-outline-variant/10 pb-4 last:border-0"
                    >
                      <dt className="text-label-sm font-bold uppercase tracking-wide text-on-surface">
                        {row.label}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-body-md text-on-surface">
                        <BriefValueDisplay value={row.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section>
              <h2 className="mb-4 font-display text-headline-md text-on-surface">
                Recommended scope
              </h2>
              <p className="mb-4 text-body-md text-on-surface-variant">
                {quote.briefEstimate
                  ? "No catalog package was selected, so this estimate is generated from your project brief, service type, timeline, and complexity signals."
                  : "Based on your brief, we recommend starting with the package and add-ons below. Totals use live catalog pricing."}
              </p>
              <dl className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-outline-variant/10 pb-4">
                  <dt className="text-label-sm text-on-surface-variant">
                    Service
                  </dt>
                  <dd className="font-medium text-on-surface">
                    {quote.serviceName}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-outline-variant/10 pb-4">
                  <div>
                    <dt className="text-label-sm text-on-surface-variant">
                      {quote.briefEstimate ? "Scope estimate" : "Package"}
                    </dt>
                    <dd className="mt-1 font-medium text-on-surface">
                      {quote.packageName}
                    </dd>
                  </div>
                  <dd className="font-semibold text-on-surface">
                    {formatMoney(quote.packagePrice)}
                  </dd>
                </div>
                {quote.briefEstimate ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <p className="mb-2 text-mono-label uppercase tracking-wider text-on-surface-variant">
                      Suggested range
                    </p>
                    <p className="font-display text-headline-md text-primary">
                      {formatMoney(quote.briefEstimate.low)} –{" "}
                      {formatMoney(quote.briefEstimate.high)}
                    </p>
                    {quote.briefEstimate.rationale.length > 0 ? (
                      <ul className="mt-3 space-y-1.5 text-sm text-on-surface-variant">
                        {quote.briefEstimate.rationale.map((line) => (
                          <li key={line}>· {line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
                {quote.addons.length > 0 ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <p className="mb-3 text-mono-label uppercase tracking-wider text-on-surface-variant">
                      Add-ons
                    </p>
                    <ul className="space-y-3">
                      {quote.addons.map((addon) => (
                        <li
                          key={addon.id}
                          className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                        >
                          <span className="text-on-surface">{addon.name}</span>
                          <span className="text-on-surface-variant">
                            {formatMoney(addon.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-outline-variant/20 pt-4">
                  <div>
                    <dt className="text-label-sm text-on-surface-variant">
                      {quote.briefEstimate
                        ? "Brief estimate"
                        : "Package subtotal"}
                    </dt>
                    <dd className="text-sm text-on-surface-variant">
                      {formatMoney(quote.packagePrice)}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-label-sm text-on-surface-variant">
                      Add-ons subtotal
                    </dt>
                    <dd className="text-sm text-on-surface-variant">
                      {formatMoney(quote.addonTotal)}
                    </dd>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-primary px-5 py-4 text-on-primary">
                  <dt className="font-display text-headline-md">
                    Estimated total
                  </dt>
                  <dd className="font-display text-price-xl">
                    {formatMoney(quote.totalPrice)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-outline-variant/15 bg-surface-container-low px-5 py-5">
              {isSubmitted ? (
                <>
                  <p className="font-semibold text-on-surface">
                    Proposal submitted
                  </p>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    Our team has your proposal and a confirmation was sent to{" "}
                    {quote.customerEmail}. We’ll be in touch soon.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-on-surface">Next steps</p>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    Happy with this estimate? Submit it and we’ll email the
                    proposal details to our team, then send you a confirmation
                    that we received your proposal. Valid for 30 days.
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={handleSubmitProposal}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Submitting…"
                        : "Submit proposal"}
                    </Button>
                  </div>
                </>
              )}
            </section>

            <div className="flex flex-wrap gap-3">
              <ProposalPDF quote={quote} />
              <Link href="/quote">
                <Button variant="secondary">Build another</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
