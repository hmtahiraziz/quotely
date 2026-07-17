"use client";

import { FormEvent, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BriefAnswers, PricingCatalog, WizardStep } from "@/types/quote";
import { estimateFromBrief } from "@/lib/briefEstimate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDialog } from "@/components/ui/Dialog";
import { TopNav } from "@/components/TopNav";
import { PriceSummary } from "@/components/QuoteWizard/PriceSummary";
import {
  StepServiceSelect,
  isOtherService,
} from "@/components/QuoteWizard/StepServiceSelect";
import {
  StepBrief,
  getBriefFieldsForService,
  isBriefComplete,
} from "@/components/QuoteWizard/StepBrief";
import { StepPackageSelect, NO_PACKAGE_ID } from "@/components/QuoteWizard/StepPackageSelect";
import { StepAddons } from "@/components/QuoteWizard/StepAddons";
import {
  IconArrowRight,
  IconDoc,
  IconPackage,
  IconPen,
  IconPlusCircle,
  IconSettings,
  IconUser,
} from "@/components/ui/Icons";

const STEPS: WizardStep[] = ["service", "brief", "package", "addons", "contact"];

const STEP_META: Record<
  WizardStep,
  {
    label: string;
    title: string;
    Icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  service: { label: "Service", title: "Service Selection", Icon: IconSettings },
  brief: { label: "Brief", title: "Project Brief", Icon: IconPen },
  package: { label: "Package", title: "Package Selection", Icon: IconPackage },
  addons: { label: "Add-ons", title: "Recommended Add-ons", Icon: IconPlusCircle },
  contact: { label: "Contact", title: "Contact Details", Icon: IconUser },
};

interface QuoteWizardProps {
  catalog: PricingCatalog;
}

export function QuoteWizard({ catalog }: QuoteWizardProps) {
  const router = useRouter();
  const { confirm, alert } = useDialog();
  const [step, setStep] = useState<WizardStep>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [addonsSkipped, setAddonsSkipped] = useState(false);
  const [brief, setBrief] = useState<BriefAnswers>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customServiceNote, setCustomServiceNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packages = useMemo(
    () => catalog.packages.filter((p) => p.serviceId === serviceId),
    [catalog.packages, serviceId]
  );

  const addons = useMemo(
    () => catalog.addons.filter((a) => a.serviceId === serviceId),
    [catalog.addons, serviceId]
  );

  const selectedService =
    catalog.services.find((s) => s.id === serviceId) ?? null;
  const selectedPackage =
    packageId && packageId !== NO_PACKAGE_ID
      ? packages.find((p) => p.id === packageId) ?? null
      : null;
  const selectedAddons = addons.filter((a) => addonIds.includes(a.id));
  const briefFields = getBriefFieldsForService(selectedService?.name);

  const briefEstimate = useMemo(() => {
    if (!selectedService || packageId !== NO_PACKAGE_ID) return null;
    return estimateFromBrief({
      serviceName: selectedService.name,
      brief,
      packagePrices: packages.map((p) => p.price),
      customServiceNote,
    });
  }, [selectedService, packageId, brief, packages, customServiceNote]);

  const packageLineAmount = selectedPackage?.price ?? briefEstimate?.amount ?? 0;
  const addonLineTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const estimatedTotal = packageLineAmount + addonLineTotal;

  const breakdown = [
    ...(briefEstimate
      ? [
          {
            label: briefEstimate.label,
            amount: briefEstimate.amount,
          },
        ]
      : selectedPackage
        ? [{ label: selectedPackage.name, amount: selectedPackage.price }]
        : []),
    ...selectedAddons.map((a) => ({ label: a.name, amount: a.price })),
  ];

  const summaryNote = briefEstimate
    ? `Range ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(briefEstimate.low)} – ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(briefEstimate.high)} · based on your brief`
    : undefined;

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  async function selectService(id: string) {
    if (id === serviceId) return;

    const hasProgress =
      Object.values(brief).some((v) => v.trim().length > 0) ||
      Boolean(packageId) ||
      addonIds.length > 0 ||
      customServiceNote.trim().length > 0;

    if (hasProgress) {
      const ok = await confirm({
        title: "Switch service?",
        message:
          "Changing the service will clear your brief, package, and add-ons for this quote.",
        confirmLabel: "Switch service",
        cancelLabel: "Keep current",
        tone: "warning",
      });
      if (!ok) return;
    }

    setServiceId(id);
    setPackageId(null);
    setAddonIds([]);
    setAddonsSkipped(false);
    setBrief({});
    setCustomServiceNote("");
    setError(null);
  }

  function toggleAddon(id: string) {
    setAddonsSkipped(false);
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function skipPackage() {
    setPackageId(NO_PACKAGE_ID);
    setStep("addons");
  }

  function skipAddons() {
    setAddonIds([]);
    setAddonsSkipped(true);
    setStep("contact");
  }

  function canContinue(): boolean {
    if (step === "service") {
      if (!serviceId) return false;
      if (isOtherService(selectedService)) {
        return customServiceNote.trim().length >= 8;
      }
      return true;
    }
    if (step === "brief") {
      return isBriefComplete(briefFields, brief);
    }
    if (step === "package") return Boolean(packageId);
    if (step === "addons") return true;
    return customerName.trim().length > 0 && customerEmail.trim().length > 0;
  }

  function goNext() {
    if (!canContinue()) return;
    if (step === "addons" && addonIds.length === 0) {
      setAddonsSkipped(true);
    }
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  }

  function goBack() {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!serviceId || !packageId) return;

    setSubmitting(true);
    setError(null);

    const cleanedBrief = Object.fromEntries(
      Object.entries(brief).filter(([, v]) => v.trim().length > 0)
    );

    const resolvedPackageId =
      packageId === NO_PACKAGE_ID ? undefined : packageId;

    try {
      const quote = await api.createQuote({
        serviceId,
        ...(resolvedPackageId ? { packageId: resolvedPackageId } : {}),
        addonIds,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        brief: cleanedBrief,
        ...(isOtherService(selectedService)
          ? { customServiceNote: customServiceNote.trim() }
          : {}),
      });
      router.push(`/proposal/${quote.quoteId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create quote";
      setError(message);
      setSubmitting(false);
      await alert({
        title: "Couldn’t create proposal",
        message,
        confirmLabel: "Try again",
        tone: "danger",
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav variant="app" confirmExit />

      <div className="flex flex-1">
        <aside className="fixed left-0 top-[72px] z-30 hidden h-[calc(100vh-72px)] w-[300px] flex-col border-r border-outline-variant/10 bg-surface-container-lowest p-6 lg:flex xl:w-[360px]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconDoc size={20} />
            </div>
            <div>
              <div className="font-display text-headline-md font-semibold text-primary">
                New Proposal
              </div>
              <div className="text-label-sm text-on-surface-variant">
                In Progress
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {STEPS.map((s, i) => {
              const active = s === step;
              const done = i < stepIndex;
              const { Icon } = STEP_META[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (done || active) setStep(s);
                  }}
                  disabled={!done && !active}
                  className={`flex w-full select-none items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    active
                      ? "bg-surface-container-low font-semibold text-primary"
                      : done
                        ? "text-on-surface hover:bg-surface-container-low"
                        : "cursor-default text-on-surface-variant/50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-label-sm">{STEP_META[s].label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-outline-variant/10 pt-6">
            <PriceSummary
              amount={estimatedTotal}
              breakdown={breakdown}
              compact
              note={summaryNote}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-surface lg:ml-[300px] xl:ml-[360px]">
          <div className="mx-auto max-w-canvas px-4 py-8 pb-28 sm:px-10">
            <div className="mb-10">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
                  Step {stepIndex + 1} of {STEPS.length}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  {STEP_META[step].title}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mb-8 lg:hidden">
              <PriceSummary
                amount={estimatedTotal}
                breakdown={breakdown}
                note={summaryNote}
              />
            </div>

            {step === "service" && (
              <StepServiceSelect
                services={catalog.services}
                selectedId={serviceId}
                customNote={customServiceNote}
                onSelect={selectService}
                onCustomNoteChange={setCustomServiceNote}
              />
            )}

            {step === "brief" && selectedService && (
              <StepBrief
                serviceName={selectedService.name}
                answers={brief}
                onChange={setBrief}
              />
            )}

            {step === "package" && (
              <StepPackageSelect
                packages={packages}
                selectedId={packageId}
                onSelect={setPackageId}
                onSkip={skipPackage}
              />
            )}

            {step === "addons" && (
              <StepAddons
                addons={addons}
                selectedIds={addonIds}
                onToggle={toggleAddon}
                onSkip={skipAddons}
                skipped={addonsSkipped}
              />
            )}

            {step === "contact" && (
              <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
                <div>
                  <h2 className="font-display text-display-md text-primary">
                    Your details
                  </h2>
                  <p className="mt-3 text-body-lg text-on-surface-variant">
                    We&apos;ll put these on the proposal. Pricing is calculated
                    on the server from your catalog selections.
                  </p>
                </div>
                <Input
                  label="Full name"
                  name="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Jordan Lee"
                />
                <Input
                  label="Work email"
                  name="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="jordan@company.com"
                />
                {brief.projectName ? (
                  <p className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                    Proposal for{" "}
                    <span className="font-medium text-on-surface">
                      {brief.projectName}
                    </span>
                    {selectedPackage
                      ? ` · estimated ${new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(estimatedTotal)}`
                      : null}
                  </p>
                ) : null}
                {error ? (
                  <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                    {error}
                  </p>
                ) : null}
                <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant/10 pt-8">
                  <Button type="button" variant="secondary" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="submit" disabled={submitting || !canContinue()}>
                    {submitting ? "Creating proposal…" : "Generate proposal"}
                  </Button>
                </div>
              </form>
            )}

            {step !== "contact" && (
              <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/10 pt-8">
                {stepIndex > 0 ? (
                  <Button type="button" variant="secondary" onClick={goBack}>
                    Back
                  </Button>
                ) : (
                  <Link href="/">
                    <Button type="button" variant="secondary">
                      Back to home
                    </Button>
                  </Link>
                )}
                <Button type="button" onClick={goNext} disabled={!canContinue()}>
                  Next Step
                  <IconArrowRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 z-40 flex w-full justify-around overflow-x-auto border-t border-outline-variant/15 bg-surface px-1 py-2 lg:hidden">
        {STEPS.map((s) => {
          const active = s === step;
          const { Icon } = STEP_META[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                const i = STEPS.indexOf(s);
                if (i <= stepIndex) setStep(s);
              }}
              className={`flex min-w-[4.25rem] select-none flex-col items-center rounded-lg px-2 py-2 ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              <Icon size={18} />
              <span className="mt-0.5 text-[10px] font-medium">
                {STEP_META[s].label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
