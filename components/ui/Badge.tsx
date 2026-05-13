import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-white/10 bg-white/10 text-ribuzz-muted",
  success: "border-emerald-300/25 bg-emerald-300/12 text-emerald-200",
  warning: "border-ribuzz-accent/25 bg-ribuzz-accent/12 text-ribuzz-pink",
  danger: "border-red-300/25 bg-red-400/12 text-red-200",
  info: "border-ribuzz-cyan/25 bg-ribuzz-cyan/12 text-ribuzz-cyan"
};

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
