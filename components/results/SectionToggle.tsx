"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}

export function SectionToggle({
  label,
  sublabel,
  children,
  defaultOpen = false,
  accent = "text-ribuzz-accent",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition hover:bg-white/[0.05]"
      >
        <div>
          <p className="font-semibold text-ribuzz-primary">{label}</p>
          {sublabel && (
            <p className="mt-0.5 text-xs text-ribuzz-muted">{sublabel}</p>
          )}
        </div>
        <span
          className={cn(
            "text-sm transition-transform duration-300",
            accent,
            open && "rotate-180"
          )}
        >
          ▼
        </span>
      </button>

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
