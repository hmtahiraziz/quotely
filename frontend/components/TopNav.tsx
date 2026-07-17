"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { useDialog } from "@/components/ui/Dialog";

interface TopNavProps {
  variant?: "marketing" | "app";
  /** When true, Exit asks before leaving the quote builder */
  confirmExit?: boolean;
}

export function TopNav({
  variant = "marketing",
  confirmExit = false,
}: TopNavProps) {
  const router = useRouter();
  const { confirm } = useDialog();

  async function handleExit() {
    if (!confirmExit) {
      router.push("/");
      return;
    }

    const ok = await confirm({
      title: "Leave this proposal?",
      message:
        "Your progress in this quote won’t be saved. You can always start a new one later.",
      confirmLabel: "Leave",
      cancelLabel: "Keep editing",
      tone: "warning",
    });

    if (ok) router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/10 bg-surface/90 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-10">
        <BrandLogo />

        {variant === "marketing" ? (
          <>
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/"
                className="border-b-2 border-primary pb-0.5 text-body-md font-semibold text-primary"
              >
                Home
              </Link>
              <a
                href="#features"
                className="text-body-md text-secondary transition-colors hover:text-primary-container"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-body-md text-secondary transition-colors hover:text-primary-container"
              >
                How it works
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/quote"
                className="hidden rounded-lg border border-outline-variant/20 px-4 py-2 text-label-sm text-on-surface transition-colors hover:bg-surface-container-low sm:inline-flex"
              >
                Dashboard
              </Link>
              <Link
                href="/quote"
                className="inline-flex select-none items-center rounded-lg bg-primary px-5 py-2 text-label-sm text-on-primary transition-colors hover:bg-primary-hover"
              >
                Get Started
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-body-md text-secondary sm:inline">
              Support
            </span>
            <Link
              href="/quote"
              className="rounded-lg bg-primary px-4 py-2 text-label-sm text-on-primary transition-colors hover:bg-primary-hover"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleExit}
              className="rounded-lg border border-outline-variant/30 px-4 py-2 text-label-sm text-primary transition-colors hover:bg-surface-container-high"
            >
              Exit
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
