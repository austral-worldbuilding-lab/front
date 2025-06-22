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
        ghost: "bg-transparent",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      color: {
        primary: "",
        secondary: "",
        tertiary: "",
        danger: "",
        ghost: "",
      },
    },
    compoundVariants: [
      // Filled variants
      {
        variant: "filled",
        color: "primary",
        className:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
      },
      {
        variant: "filled",
        color: "secondary",
        className:
          "bg-secondary text-primary hover:bg-secondary-hover active:bg-secondary-active",
      },
      {
        variant: "filled",
        color: "tertiary",
        className:
          "bg-white text-tertiary hover:text-tertiary-hover active:text-tertiary-active",
      },
      {
        variant: "filled",
        color: "danger",
        className:
          "bg-danger text-white hover:bg-danger-hover active:bg-danger-active",
      },
      {
        variant: "filled",
        color: "ghost",
        className:
          "bg-transparent text-primary hover:bg-tertiary/5 active:bg-tertiary/10",
      },

      // Outline variants
      {
        variant: "outline",
        color: "primary",
        className:
          "bg-transparent text-primary border-primary hover:bg-primary/5 active:bg-primary/10",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "bg-transparent text-secondary border-secondary hover:bg-secondary/5 active:bg-secondary/10",
      },
      {
        variant: "outline",
        color: "tertiary",
        className:
          "bg-transparent text-tertiary border-tertiary hover:bg-tertiary/5 active:bg-tertiary/10",
      },
      {
        variant: "outline",
        color: "danger",
        className:
          "bg-transparent text-danger border-danger hover:bg-danger/5 active:bg-danger/10",
      },
      {
        variant: "outline",
        color: "ghost",
        className:
          "bg-transparent text-primary border-primary hover:bg-tertiary/5 active:bg-tertiary/10",
      },

      // Text variants
      {
        variant: "text",
        color: "primary",
        className:
          "bg-transparent text-primary hover:text-primary/50 active:text-primary/50 w-fit",
      },
      {
        variant: "text",
        color: "secondary",
        className:
          "bg-transparent text-secondary hover:bg-secondary/5 active:bg-secondary/10",
      },
      {
        variant: "text",
        color: "tertiary",
        className:
          "bg-transparent text-tertiary hover:bg-tertiary/5 active:bg-tertiary/10",
      },
      {
        variant: "text",
        color: "danger",
        className:
          "bg-transparent text-danger hover:bg-danger/5 active:bg-danger/10",
      },
      {
        variant: "text",
        color: "ghost",
        className:
          "bg-transparent text-primary hover:bg-tertiary/5 active:bg-tertiary/10",
      },

      // Ghost variants
      {
        variant: "ghost",
        color: "primary",
        className:
          "bg-transparent text-primary border-primary hover:bg-tertiary/5 active:bg-tertiary/10",
      },
      {
        variant: "ghost",
        color: "secondary",
        className:
          "bg-transparent text-secondary border-secondary hover:bg-tertiary/5 active:bg-tertiary/10",
      },
      {
        variant: "ghost",
        color: "tertiary",
        className:
          "bg-transparent text-tertiary border-tertiary hover:bg-tertiary/5 active:bg-tertiary/10",
      },
      {
        variant: "ghost",
        color: "danger",
        className:
          "bg-transparent text-danger border-danger hover:bg-tertiary/5 active:bg-tertiary/10",
      },
      {
        variant: "ghost",
        color: "ghost",
        className:
          "bg-transparent text-primary hover:bg-tertiary/5 active:bg-tertiary/10",
      },
    ],
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
