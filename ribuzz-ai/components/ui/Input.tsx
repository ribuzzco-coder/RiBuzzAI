"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-base text-ribuzz-primary placeholder:text-ribuzz-soft/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl transition duration-500 focus:border-ribuzz-cyan/45 focus:outline-none focus:ring-2 focus:ring-ribuzz-cyan/12";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, "h-11", className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(base, className)} {...props} />
));
Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <select ref={ref} className={cn(base, "h-11", className)} {...(props as any)}>
      <option value="">Selecciona una opción</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
);
Select.displayName = "Select";
