"use client";

import type { Package } from "@/types/quote";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** Sentinel value meaning the user opted out of a catalog package */
export const NO_PACKAGE_ID = "__none__";

interface StepPackageSelectProps {
  packages: Package[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSkip: () => void;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function StepPackageSelect({
  packages,
  selectedId,
  onSelect,
  onSkip,
}: StepPackageSelectProps) {
  const skipped = selectedId === NO_PACKAGE_ID;

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display text-display-md text-primary md:text-display-lg">
          Choose your package
        </h2>
        <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
          Select a package that best aligns with your project requirements. You
          can add extras next — or skip packages entirely if you only need a
          custom scope.
        </p>
      </header>

      {packages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant p-6 text-body-md text-on-surface-variant">
          No packages available for this service.
        </p>
      ) : (
        <div className="grid gap-4">
          {packages.map((pkg) => {
            const selected = selectedId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onSelect(pkg.id)}
                className="text-left"
              >
                <Card
                  selected={selected}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="font-display text-headline-md text-primary">
                      {pkg.name}
                    </h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                      {pkg.description}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-price-xl text-primary">
                    {formatPrice(pkg.price)}
                  </span>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/60 px-5 py-5">
        <p className="font-display text-headline-md text-on-surface">
          Don't need a package?
        </p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          We&apos;ll price a scope estimate from your brief (goals, timeline,
          complexity, and budget if you shared one).
        </p>
        <Button
          type="button"
          variant={skipped ? "primary" : "secondary"}
          className="mt-4"
          onClick={onSkip}
        >
          {skipped ? "Using brief-based estimate ✓" : "I don’t need a package"}
        </Button>
      </div>
    </div>
  );
}
