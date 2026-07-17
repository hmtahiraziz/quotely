"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { IconAlert, IconCheckCircle, IconClose, IconInfo } from "@/components/ui/Icons";

type DialogTone = "info" | "success" | "warning" | "danger";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
}

interface AlertOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: DialogTone;
}

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

type Pending =
  | {
      kind: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      kind: "alert";
      options: AlertOptions;
      resolve: () => void;
    };

const toneIcon: Record<DialogTone, typeof IconInfo> = {
  info: IconInfo,
  success: IconCheckCircle,
  warning: IconAlert,
  danger: IconAlert,
};

const toneStyles: Record<DialogTone, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-primary/10 text-primary",
  warning: "bg-[#fef3c7] text-[#92400e]",
  danger: "bg-error-container text-error",
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ kind: "confirm", options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setPending({ kind: "alert", options, resolve });
    });
  }, []);

  function closeConfirm(result: boolean) {
    if (pending?.kind === "confirm") pending.resolve(result);
    setPending(null);
  }

  function closeAlert() {
    if (pending?.kind === "alert") pending.resolve();
    setPending(null);
  }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {mounted && pending
        ? createPortal(
            <DialogFrame
              title={pending.options.title}
              message={pending.options.message}
              tone={pending.options.tone || (pending.kind === "confirm" ? "warning" : "info")}
              onClose={
                pending.kind === "confirm"
                  ? () => closeConfirm(false)
                  : closeAlert
              }
            >
              {pending.kind === "confirm" ? (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => closeConfirm(false)}
                  >
                    {pending.options.cancelLabel || "Cancel"}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className={
                      (pending.options.tone || "warning") === "danger"
                        ? "bg-error hover:bg-error/90"
                        : undefined
                    }
                    onClick={() => closeConfirm(true)}
                    autoFocus
                  >
                    {pending.options.confirmLabel || "Confirm"}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button type="button" onClick={closeAlert} autoFocus>
                    {pending.options.confirmLabel || "Got it"}
                  </Button>
                </div>
              )}
            </DialogFrame>,
            document.body
          )
        : null}
    </DialogContext.Provider>
  );
}

function DialogFrame({
  title,
  message,
  tone,
  onClose,
  children,
}: {
  title: string;
  message: string;
  tone: DialogTone;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const Icon = toneIcon[tone];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-[#181c1a]/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative w-full max-w-md animate-dialogIn rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-card outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Close"
        >
          <IconClose size={18} />
        </button>

        <div className="flex gap-4 pr-6">
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-headline-md text-on-surface"
            >
              {title}
            </h2>
            <p
              id={descId}
              className="mt-2 text-body-md text-on-surface-variant"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return ctx;
}
