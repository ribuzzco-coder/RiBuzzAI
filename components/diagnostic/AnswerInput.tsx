"use client";

import type { Pregunta } from "@/lib/types";
import { Input, Textarea, Select } from "@/components/ui/Input";

interface Props {
  pregunta: Pregunta;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function AnswerInput({ pregunta, value, onChange, disabled }: Props) {
  // Multi-select (checkboxes): el valor es CSV de opciones marcadas
  if (pregunta.inputType === "multi-select" && pregunta.options) {
    const selected = value ? value.split("|").map((s) => s.trim()).filter(Boolean) : [];
    const toggle = (v: string) => {
      const next = selected.includes(v)
        ? selected.filter((s) => s !== v)
        : [...selected, v];
      onChange(next.join("|"));
    };
    return (
      <div className="space-y-2">
        {pregunta.options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <label
              key={o.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition duration-500 hover:-translate-y-0.5 ${
                checked
                  ? "scale-[1.006] border-ribuzz-accent/45 bg-ribuzz-accent/[0.075] shadow-[0_0_18px_rgba(230,37,255,0.08)]"
                  : "border-white/10 bg-white/[0.04] hover:border-ribuzz-cyan/25 hover:bg-white/[0.06]"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(o.value)}
                disabled={disabled}
                className="h-4 w-4 accent-ribuzz-accent"
              />
              <span className="text-sm text-ribuzz-primary">{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  // Selección única: renderizamos como radio cards para ser más visual
  if (pregunta.inputType === "select" && pregunta.options) {
    return (
      <div className="space-y-2">
        {pregunta.options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition duration-500 hover:-translate-y-0.5 ${
                checked
                  ? "scale-[1.006] border-ribuzz-accent/45 bg-ribuzz-accent/[0.075] shadow-[0_0_18px_rgba(230,37,255,0.08)]"
                  : "border-white/10 bg-white/[0.04] hover:border-ribuzz-cyan/25 hover:bg-white/[0.06]"
              }`}
            >
              <input
                type="radio"
                name={`q-${pregunta.numero}`}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                disabled={disabled}
                className="h-4 w-4 accent-ribuzz-accent"
              />
              <span className="text-sm text-ribuzz-primary">{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (pregunta.inputType === "textarea") {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={pregunta.placeholder ?? "Escribe tu respuesta..."}
        disabled={disabled}
        rows={5}
      />
    );
  }

  return (
    <Input
      type={pregunta.inputType === "number" ? "number" : pregunta.inputType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={pregunta.placeholder ?? "Escribe tu respuesta..."}
      disabled={disabled}
    />
  );
}
