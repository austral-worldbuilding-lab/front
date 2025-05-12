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
                        className="text-sm font-medium text-[var(--color-input-label)]"
                    >
                        {label}
                    </label>
                )}

                <Input
                    ref={ref}
                    disabled={disabled}
                    aria-invalid={!!error}
                    className={cn(
                        "placeholder:text-input-placeholder text-sm",
                        disabled &&
                        "bg-[var(--color-disabled-bg)] border-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] opacity-50",
                        error &&
                        "border-[var(--color-error)] text-[var(--color-error)] placeholder:text-[var(--color-error)] focus-visible:ring-[var(--color-error)]",
                        className
                    )}
                    {...props}
                />

                {error && (
                    <p className="text-xs text-[var(--color-error)]">{error}</p>
                )}
            </div>
        );
    }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
