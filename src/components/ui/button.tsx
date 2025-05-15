import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        filled: "",
        outline: "border",
        text: "",
        ghost: "bg-transparent border",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      color: {
        primary:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-active border-primary",
        secondary:
          "bg-secondary text-primary hover:bg-secondary-hover active:bg-secondary-active border-primary",
        tertiary:
          "bg-white text-tertiary hover:text-tertiary-hover active:text-tertiary-active border-tertiary",
        danger:
          "bg-danger text-white hover:bg-danger-hover active:bg-danger-active border-danger",
        ghost:
          "bg-transparent text-primary hover:bg-tertiary/5 active:bg-tertiary/10 border-primary",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
      color: "primary",
    },
  }
);

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  width?: string;
  buttonColor?: "primary" | "secondary" | "tertiary" | "danger" | "ghost";
}

function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  loading = false,
  icon,
  iconPosition = "left",
  width,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, color }),
        width ? width : "",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && iconPosition === "left" && <span>{icon}</span>}
      {children}
      {!loading && icon && iconPosition === "right" && <span>{icon}</span>}
    </Comp>
  );
}

export { Button };
