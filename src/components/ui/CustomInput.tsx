import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "../../lib/utils";

export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, disabled, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col items-start gap-1.5">
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-[var(--color-black)]"
          >
            {label}
          </label>
        )}

        <Input
          ref={ref}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "border placeholder:text-input-placeholder text-sm",
            disabled &&
              "bg-[var(--color-input-disabled-bg)] border border-[var(--color-input-disabled-border)] text-[var(--color-disabled-text)]",
            error &&
              "border-[var(--color-danger)] text-[var(--color-black)] placeholder:text-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-[var(--color-danger)] mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
