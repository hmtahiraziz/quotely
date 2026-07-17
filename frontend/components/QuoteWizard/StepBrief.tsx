"use client";

import type { BriefAnswers, BriefField } from "@/lib/briefFields";
import { getBriefFieldsForService, isBriefComplete } from "@/lib/briefFields";
import { Select } from "@/components/ui/Select";

interface StepBriefProps {
  serviceName: string;
  answers: BriefAnswers;
  onChange: (answers: BriefAnswers) => void;
}

export function StepBrief({ serviceName, answers, onChange }: StepBriefProps) {
  const fields = getBriefFieldsForService(serviceName);

  function update(id: string, value: string) {
    onChange({ ...answers, [id]: value });
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display text-display-md text-primary md:text-display-lg">
          Tell us about the project
        </h2>
        <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
          The more context you share, the more accurate your estimate and
          proposal will be. Required fields are marked — everything else is
          optional.
        </p>
        <p className="mt-2 text-label-sm text-primary">
          Service: {serviceName}
        </p>
      </header>

      <div className="max-w-2xl space-y-5">
        {fields.map((field) => (
          <BriefFieldInput
            key={field.id}
            field={field}
            value={answers[field.id] || ""}
            onChange={(value) => update(field.id, value)}
          />
        ))}
      </div>
    </div>
  );
}

function BriefFieldInput({
  field,
  value,
  onChange,
}: {
  field: BriefField;
  value: string;
  onChange: (value: string) => void;
}) {
  const shared =
    "w-full rounded-lg border border-[rgba(17,24,39,0.08)] bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_2px_rgba(0,69,50,0.1)]";

  const selectOptions = (field.options || []).filter((opt, i, arr) => {
    // Keep empty-value options once for optional fields
    if (opt.value === "" && field.required) return false;
    if (opt.value === "") {
      return arr.findIndex((o) => o.value === "") === i;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label-sm text-secondary">
        {field.label}
        {field.required ? (
          <span className="text-primary"> *</span>
        ) : (
          <span className="font-normal text-outline"> (optional)</span>
        )}
      </span>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={field.placeholder}
          className={shared}
        />
      ) : field.type === "select" ? (
        <Select
          value={value}
          onChange={onChange}
          placeholder="Select…"
          aria-label={field.label}
          options={selectOptions}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={shared}
        />
      )}
      {field.helpText ? (
        <span className="text-sm text-on-surface-variant">{field.helpText}</span>
      ) : null}
    </div>
  );
}

export { isBriefComplete, getBriefFieldsForService };
