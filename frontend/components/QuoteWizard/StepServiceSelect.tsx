"use client";

import { useState, type ComponentType } from "react";
import type { Service } from "@/types/quote";
import { Card } from "@/components/ui/Card";
import {
  IconCart,
  IconCheckCircle,
  IconCloud,
  IconCode,
  IconMegaphone,
  IconPalette,
  IconPen,
  IconPlusCircle,
  IconSearch,
  IconShield,
} from "@/components/ui/Icons";

const ICONS: ComponentType<{ size?: number; className?: string }>[] = [
  IconPalette,
  IconCode,
  IconMegaphone,
  IconSearch,
  IconCloud,
  IconShield,
  IconCart,
  IconPen,
];

function iconForService(name: string, index: number) {
  const key = name.toLowerCase();
  if (key.includes("other") || key.includes("custom")) return IconPlusCircle;
  if (key.includes("design") || key.includes("brand") || key.includes("graphic"))
    return IconPalette;
  if (
    key.includes("app") ||
    key.includes("develop") ||
    key.includes("web") ||
    key.includes("devops") ||
    key.includes("wordpress") ||
    key.includes("shopify")
  )
    return IconCode;
  if (
    key.includes("market") ||
    key.includes("social") ||
    key.includes("paid") ||
    key.includes("advertis")
  )
    return IconMegaphone;
  if (key.includes("seo") || key.includes("analytics") || key.includes("data"))
    return IconSearch;
  if (key.includes("cloud")) return IconCloud;
  if (
    key.includes("security") ||
    key.includes("cyber") ||
    key.includes("qa") ||
    key.includes("testing")
  )
    return IconShield;
  if (key.includes("commerce") || key.includes("e-commerce")) return IconCart;
  if (
    key.includes("content") ||
    key.includes("writ") ||
    key.includes("email") ||
    key.includes("translat")
  )
    return IconPen;
  return ICONS[index % ICONS.length];
}

export function isOtherService(service: Service | null | undefined) {
  if (!service) return false;
  return /other/i.test(service.name);
}

interface StepServiceSelectProps {
  services: Service[];
  selectedId: string | null;
  customNote: string;
  onSelect: (id: string) => void;
  onCustomNoteChange: (value: string) => void;
}

export function StepServiceSelect({
  services,
  selectedId,
  customNote,
  onSelect,
  onCustomNoteChange,
}: StepServiceSelectProps) {
  const [query, setQuery] = useState("");

  const sorted = [...services].sort((a, b) => {
    const aOther = isOtherService(a) ? 1 : 0;
    const bOther = isOtherService(b) ? 1 : 0;
    if (aOther !== bOther) return aOther - bOther;
    return a.name.localeCompare(b.name);
  });

  const filtered = sorted.filter((service) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      service.name.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q)
    );
  });

  const selected = sorted.find((s) => s.id === selectedId) ?? null;
  const showOtherNote = isOtherService(selected);

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display text-display-md text-primary md:text-display-lg">
          What service do you need?
        </h2>
        <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
          Browse our catalog or search. Packages and add-ons in the next steps
          stay matched to your selection. Can&apos;t find it? Choose{" "}
          <span className="font-medium text-on-surface">
            Other / Custom Request
          </span>
          .
        </p>
      </header>

      <div className="relative mb-6 max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
          <IconSearch size={18} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services…"
          className="w-full rounded-lg border border-[rgba(17,24,39,0.08)] bg-surface-container-lowest py-2.5 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_2px_rgba(0,69,50,0.1)]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant p-6 text-body-md text-on-surface-variant">
          No services match &ldquo;{query}&rdquo;. Try another term, or select{" "}
          <button
            type="button"
            className="font-medium text-primary underline underline-offset-2"
            onClick={() => {
              setQuery("");
              const other = sorted.find(isOtherService);
              if (other) onSelect(other.id);
            }}
          >
            Other / Custom Request
          </button>
          .
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service, index) => {
            const selectedCard = selectedId === service.id;
            const Icon = iconForService(service.name, index);
            const isOther = isOtherService(service);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect(service.id)}
                className="select-none text-left"
              >
                <Card
                  selected={selectedCard}
                  className={`group h-full ${
                    isOther
                      ? "border-dashed border-primary/40 bg-primary/[0.02]"
                      : ""
                  }`}
                >
                  {selectedCard ? (
                    <span className="absolute right-4 top-4 text-primary">
                      <IconCheckCircle size={22} />
                    </span>
                  ) : null}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container-high text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                    <Icon size={28} />
                  </div>
                  <h3 className="mb-2 font-display text-headline-md text-primary">
                    {service.name}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    {service.description}
                  </p>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {showOtherNote ? (
        <div className="mt-8 max-w-xl rounded-xl border border-primary/20 bg-surface-container-lowest p-5">
          <label className="flex flex-col gap-1.5" htmlFor="custom-service-note">
            <span className="text-label-sm text-secondary">
              Describe what you need
            </span>
            <textarea
              id="custom-service-note"
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              rows={3}
              required
              placeholder="e.g. We need a custom internal portal for vendor onboarding and approvals…"
              className="rounded-lg border border-[rgba(17,24,39,0.08)] bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_2px_rgba(0,69,50,0.1)]"
            />
          </label>
          <p className="mt-2 text-sm text-on-surface-variant">
            Packages and add-ons for custom work stay available in the next
            steps.
          </p>
        </div>
      ) : null}
    </div>
  );
}
