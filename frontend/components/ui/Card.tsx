import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export function Card({
  className = "",
  selected = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`relative rounded-xl border bg-surface-container-lowest p-6 transition-all duration-300 ${
        selected
          ? "border-primary shadow-[0_0_0_2px_rgba(0,69,50,0.1)]"
          : "border-outline-variant/20 hover:-translate-y-0.5 hover:shadow-card"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
