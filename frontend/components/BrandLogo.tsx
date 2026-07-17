import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const heights = {
  sm: 40,
  md: 52,
  lg: 64,
};

/** Crisp vector mark — speech bubble + quotation marks (Stitch Quotely) */
function QuotelyMark({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        fill="#004532"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28 2C14.193 2 3 13.193 3 27c0 7.92 3.68 14.97 9.42 19.55L7.1 54.8c-.58 1 .5 2.15 1.55 1.65l12.2-5.75A24.8 24.8 0 0 0 28 52c13.807 0 25-11.193 25-25S41.807 2 28 2Zm0 8.5c9.113 0 16.5 7.387 16.5 16.5S37.113 43.5 28 43.5c-2.42 0-4.72-.52-6.8-1.46l-7.35 3.47 2.28-7.05A16.42 16.42 0 0 1 11.5 27c0-9.113 7.387-16.5 16.5-16.5Z"
      />
      {/* Classic opening quotes */}
      <path
        fill="#004532"
        d="M18.5 31.5c-1.8 0-3.25-1.5-3.25-3.4V22c0-3.9 2.55-6.6 5.9-6.6.6 0 1.1.5 1.1 1.1v3.2c0 .55-.45 1-1 1-1.15 0-2.05 1-2.05 2.35v.55h2.7c1.15 0 2.1.95 2.1 2.1v4.4c0 1.15-.95 2.1-2.1 2.1h-3.4Zm12.25 0c-1.8 0-3.25-1.5-3.25-3.4V22c0-3.9 2.55-6.6 5.9-6.6.6 0 1.1.5 1.1 1.1v3.2c0 .55-.45 1-1 1-1.15 0-2.05 1-2.05 2.35v.55h2.7c1.15 0 2.1.95 2.1 2.1v4.4c0 1.15-.95 2.1-2.1 2.1h-3.4Z"
      />
    </svg>
  );
}

export function BrandLogo({
  href = "/",
  size = "md",
  className = "",
}: BrandLogoProps) {
  const height = heights[size];

  const content = (
    <span
      className={`inline-flex items-center gap-3 ${className}`}
      style={{ height }}
    >
      <QuotelyMark className="h-full w-auto shrink-0" />
      <span
        className="select-none font-display font-semibold leading-none tracking-tight text-[#1a1f1c]"
        style={{ fontSize: Math.round(height * 0.55) }}
      >
        Quotely
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="inline-flex items-center"
      aria-label="Quotely home"
    >
      {content}
    </Link>
  );
}
