"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

interface PriceSummaryProps {
  amount: number;
  label?: string;
  breakdown?: Array<{ label: string; amount: number }>;
  compact?: boolean;
  note?: string;
}

export function PriceSummary({
  amount,
  label = "Live Summary",
  breakdown = [],
  compact = false,
  note,
}: PriceSummaryProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, amount, {
      duration: 0.45,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [amount, motionValue, rounded]);

  const format = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  if (compact) {
    return (
      <div className="rounded-xl bg-primary px-4 py-4 text-on-primary shadow-md">
        <span className="text-label-sm uppercase tracking-widest opacity-80">
          {label}
        </span>
        <p className="mt-1 font-display text-price-xl">{format(display)}</p>
        {note ? (
          <p className="mt-2 text-[11px] leading-snug text-on-primary/75">
            {note}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <motion.aside layout className="space-y-3">
      <div className="rounded-xl bg-primary px-4 py-4 text-on-primary shadow-md">
        <span className="text-label-sm uppercase tracking-widest opacity-80">
          {label}
        </span>
        <p className="mt-1 font-display text-price-xl">{format(display)}</p>
        {note ? (
          <p className="mt-2 text-[11px] leading-snug text-on-primary/75">
            {note}
          </p>
        ) : null}
      </div>
      {breakdown.length > 0 ? (
        <ul className="space-y-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 text-sm">
          {breakdown.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 text-on-surface-variant"
            >
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 font-medium text-on-surface">
                {format(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </motion.aside>
  );
}
