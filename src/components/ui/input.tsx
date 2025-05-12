import * as React from "react"
import { cn } from "@/lib/utils"
import { Input as BaseInput } from "@/components/ui/input"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, disabled, className, id, ...props }, ref) => {
        const inputId = id || React.useId()

        return (
            <div className="w-full flex flex-col items-start gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-[var(--color-input-label)]"
                    >
                        {label}
                    </label>
                )}

                <BaseInput
                    id={inputId}
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
        )
    }
)

Input.displayName = "Input"

export { Input }
