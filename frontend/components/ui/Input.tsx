import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...props },
  ref
) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-label-sm text-secondary">{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={`rounded-lg border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_2px_rgba(0,69,50,0.1)] ${
          error ? "border-error" : "border-[rgba(17,24,39,0.05)]"
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </label>
  );
});
