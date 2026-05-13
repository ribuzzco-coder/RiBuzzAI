import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glow-card rounded-2xl p-5 text-ribuzz-primary transition duration-300 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-semibold text-ribuzz-primary">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-ribuzz-muted">{description}</p>
      )}
    </div>
  );
}
