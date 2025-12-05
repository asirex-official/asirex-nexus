import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow-md hover:-translate-y-1 hover:brightness-110",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-muted/50 hover:border-primary/50 hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // ASIREX Premium Variants
        hero: "bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-glow-md hover:shadow-glow-lg hover:-translate-y-1.5 hover:brightness-110 relative overflow-hidden",
        glass: "bg-white/5 backdrop-blur-2xl border border-white/10 text-foreground hover:bg-white/10 hover:border-primary/30 hover:-translate-y-1",
        glow: "bg-primary text-primary-foreground relative overflow-hidden shadow-glow-sm hover:shadow-glow-lg hover:-translate-y-1 btn-glow",
        premium: "bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground font-bold shadow-glow-md hover:shadow-glow-lg hover:-translate-y-1.5 bg-[length:200%_auto] hover:bg-right transition-all duration-500",
        neon: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-glow-md hover:-translate-y-1 relative",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
