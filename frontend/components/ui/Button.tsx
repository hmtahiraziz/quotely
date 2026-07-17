import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover/90 disabled:bg-outline-variant disabled:text-on-surface-variant",
  secondary:
    "bg-transparent text-on-surface border border-outline-variant/50 hover:bg-surface-container-high",
  ghost:
    "bg-transparent text-secondary hover:text-primary-container hover:bg-surface-container-low",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className = "", variant = "primary", children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={`inline-flex select-none items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-label-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
