"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { IconCheck, IconChevronDown } from "@/components/ui/Icons";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  className = "",
  id,
  "aria-label": ariaLabel,
}: SelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }

    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value)
    );
    setHighlight(idx);
  }, [open, options, value]);

  function pick(next: string) {
    onChange(next);
    close();
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      return;
    }
  }

  function onListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlight >= 0 && options[highlight]) {
        pick(options[highlight].value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(options.length - 1);
    }
  }

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full select-none items-center justify-between gap-3 rounded-lg border bg-surface-container-lowest px-4 py-3 text-left text-body-md outline-none transition-colors focus-visible:border-primary focus-visible:shadow-[0_0_0_2px_rgba(0,69,50,0.1)] disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? "border-primary shadow-[0_0_0_2px_rgba(0,69,50,0.1)]"
            : "border-[rgba(17,24,39,0.08)] hover:border-outline-variant"
        }`}
      >
        <span
          className={
            selected ? "text-on-surface" : "text-outline"
          }
        >
          {display}
        </span>
        <IconChevronDown
          size={18}
          className={`text-on-surface-variant transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            highlight >= 0 ? `${listId}-opt-${highlight}` : undefined
          }
          onKeyDown={onListKeyDown}
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-1.5 shadow-card focus:outline-none"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === highlight;
            return (
              <li
                key={opt.value || opt.label}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(opt.value)}
                className={`flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-2.5 text-body-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected ? (
                  <IconCheck size={16} className="text-primary" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
