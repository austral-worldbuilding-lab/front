import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  as?: "input" | "textarea";
  about?: string;
}

const CustomInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CustomInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(
  (
    { label, error, disabled, className, as = "input", about, ...props },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col items-start gap-1.5">
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-[var(--color-black)] flex items-center gap-1"
          >
            {label}
            {about && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1 cursor-pointer align-middle">
                    <HelpCircle size={16} className="text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>{about}</TooltipContent>
              </Tooltip>
            )}
          </label>
        )}
        {as === "textarea" ? (
          <Textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
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
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
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
        )}
        {error && (
          <p className="text-xs text-[var(--color-danger)] mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
