"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-ribuzz-champagne/35 bg-gradient-to-br from-[#181820] to-[#2B2234] text-ribuzz-platinum shadow-[0_0_18px_rgba(201,179,126,0.12)] hover:border-ribuzz-champagne/55 hover:shadow-[0_0_28px_rgba(201,179,126,0.18)] disabled:opacity-50",
  secondary:
    "border border-white/12 bg-white/[0.055] text-ribuzz-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-ribuzz-champagne/30 hover:bg-white/[0.08]",
  ghost: "text-ribuzz-muted hover:bg-white/[0.055] hover:text-ribuzz-primary",
  danger: "border border-red-400/25 bg-red-950/70 text-white shadow-[0_0_18px_rgba(220,38,38,0.16)] hover:bg-red-900"
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-6 text-base"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold transition duration-500 hover:-translate-y-0.5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ribuzz-accent/50 focus:ring-offset-2 focus:ring-offset-ribuzz-surface",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? "Cargando..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
