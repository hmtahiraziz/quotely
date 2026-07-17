"use client";

import type { Addon } from "@/types/quote";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface StepAddonsProps {
  addons: Addon[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSkip: () => void;
  skipped: boolean;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function StepAddons({
  addons,
  selectedIds,
  onToggle,
  onSkip,
  skipped,
}: StepAddonsProps) {
  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display text-display-md text-primary md:text-display-lg">
          Recommended add-ons
        </h2>
        <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
          Optional enhancements matched to your selected service. Skip if the
          base scope is enough.
        </p>
      </header>

      {addons.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant p-6 text-body-md text-on-surface-variant">
          No add-ons for this service. Continue to contact details.
        </p>
      ) : (
        <div className="grid gap-4">
          {addons.map((addon) => {
            const selected = selectedIds.includes(addon.id);
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => onToggle(addon.id)}
                className="text-left"
                aria-pressed={selected}
              >
                <Card
                  selected={selected}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[12px] ${
                        selected
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <div>
                      <h3 className="font-display text-headline-md text-primary">
                        {addon.name}
                      </h3>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        {addon.description}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-label-sm font-semibold text-on-surface">
                    +{formatPrice(addon.price)}
                  </span>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/60 px-5 py-5">
        <p className="font-display text-headline-md text-on-surface">
          Don&apos;t need add-ons?
        </p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Continue with no extras. You can always refine scope on the proposal.
        </p>
        <Button
          type="button"
          variant={skipped && selectedIds.length === 0 ? "primary" : "secondary"}
          className="mt-4"
          onClick={onSkip}
        >
          {skipped && selectedIds.length === 0
            ? "No add-ons selected ✓"
            : "I don’t need add-ons"}
        </Button>
      </div>
    </div>
  );
}
