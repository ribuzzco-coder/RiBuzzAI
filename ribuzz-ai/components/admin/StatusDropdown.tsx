"use client";

import { useState } from "react";

const STATUSES = ["mql", "sql", "contacted", "meeting_scheduled", "won", "lost", "no_fit"];

export function StatusDropdown({
  diagnosticId,
  initial
}: {
  diagnosticId: string;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);

  async function update(v: string) {
    setSaving(true);
    setValue(v);
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnostic_id: diagnosticId, status: v })
    });
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="h-10 rounded-2xl border border-white/10 bg-white/[0.08] px-3 text-sm text-ribuzz-primary"
        value={value}
        onChange={(e) => update(e.target.value)}
        disabled={saving}
      >
        <option value="">— Sin status —</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-ribuzz-muted">Guardando...</span>}
    </div>
  );
}
