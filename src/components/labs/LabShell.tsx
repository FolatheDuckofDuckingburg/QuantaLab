import React from "react";
import { SaveProgressButton } from "@/components/SaveProgressButton";

export function Slider({
  label, value, min, max, step, unit, onChange, ticks,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; onChange: (v: number) => void; ticks?: { at: number; label: string }[];
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
        <span className="font-mono text-sm">
          {value.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0)}{" "}
          <span className="text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
      />
      {ticks && (
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {ticks.map((t) => <span key={t.label}>{t.label}</span>)}
        </div>
      )}
    </div>
  );
}

export function LabShell({
  title, discipline, objectives, readouts, canvas, controls, extra, labSlug,
}: {
  title: string;
  discipline: "physics" | "chemistry" | "biology";
  objectives: string[];
  readouts: [string, string][];
  canvas: React.ReactNode;
  controls: React.ReactNode;
  extra?: React.ReactNode;
  labSlug?: string;
}) {
  const accentRing =
    discipline === "physics" ? "ring-physics/40" :
    discipline === "chemistry" ? "ring-chemistry/40" : "ring-biology/40";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip uppercase">{discipline}</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {readouts.map(([k, v]) => (
            <div key={k} className="rounded-md border border-border bg-card px-3 py-2 text-xs">
              <p className="font-mono uppercase tracking-wider text-muted-foreground">{k}</p>
              <p className="mt-0.5 font-display text-sm font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-paper ring-1 ${accentRing} graph-paper-fine`}>
          {canvas}
        </div>
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 font-display text-sm font-semibold">Instrument panel</p>
            <div className="space-y-3">{controls}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-2 font-display text-sm font-semibold">Objectives</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {objectives.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {extra && <div className="mt-4">{extra}</div>}
    </div>
  );
}
