import { useEffect, useMemo, useRef, useState } from "react";
import { SaveProgressButton } from "@/components/SaveProgressButton";

export function PendulumLab() {
  const [length, setLength] = useState(1.0);   // m
  const [gravity, setGravity] = useState(9.81); // m/s^2
  const [angle, setAngle] = useState(20);       // degrees
  const [running, setRunning] = useState(true);

  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const omega = (2 * Math.PI) / period;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t0 = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let tAcc = 0;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (running) tAcc += dt;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const pivot = { x: w / 2, y: h * 0.15 };
      const pxPerM = Math.min(w, h) * 0.32;
      const armPx = length * pxPerM;
      const theta0 = (angle * Math.PI) / 180;
      const theta = theta0 * Math.cos(omega * tAcc);
      const bob = {
        x: pivot.x + armPx * Math.sin(theta),
        y: pivot.y + armPx * Math.cos(theta),
      };
      // arc guide
      ctx.strokeStyle = "rgba(120, 90, 200, 0.25)";
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([4 * dpr, 6 * dpr]);
      ctx.beginPath();
      ctx.arc(pivot.x, pivot.y, armPx, Math.PI / 2 - theta0, Math.PI / 2 + theta0);
      ctx.stroke();
      ctx.setLineDash([]);
      // pivot
      ctx.fillStyle = "#3b2470";
      ctx.beginPath(); ctx.arc(pivot.x, pivot.y, 6 * dpr, 0, Math.PI * 2); ctx.fill();
      // arm
      ctx.strokeStyle = "#3b2470";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.moveTo(pivot.x, pivot.y); ctx.lineTo(bob.x, bob.y); ctx.stroke();
      // bob
      const grad = ctx.createRadialGradient(bob.x - 4, bob.y - 4, 2, bob.x, bob.y, 22 * dpr);
      grad.addColorStop(0, "#b794f4");
      grad.addColorStop(1, "#5b21b6");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(bob.x, bob.y, 18 * dpr, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [length, gravity, angle, omega, running]);

  // graph of theta over time (static plot of one cycle)
  const path = useMemo(() => {
    const pts: string[] = [];
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * period * 2;
      const th = Math.cos((2 * Math.PI / period) * t);
      const x = (i / N) * 100;
      const y = 50 - th * 40;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [period]);

  return (
    <LabShell
      title="Simple Pendulum"
      discipline="physics"
      objectives={[
        "Predict T = 2π√(L/g).",
        "Notice: amplitude doesn't affect period (small-angle).",
        "Compare Earth (9.81) vs Moon (1.62) gravity.",
      ]}
      readouts={[
        ["Period T", `${period.toFixed(3)} s`],
        ["Frequency", `${(1 / period).toFixed(3)} Hz`],
        ["Angular ω", `${omega.toFixed(3)} rad/s`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <Slider label="Length L" value={length} min={0.2} max={3} step={0.05} unit="m" onChange={setLength} />
          <Slider label="Gravity g" value={gravity} min={1.62} max={24.79} step={0.1} unit="m/s²" onChange={setGravity}
            ticks={[{ at: 1.62, label: "Moon" }, { at: 9.81, label: "Earth" }, { at: 24.79, label: "Jupiter" }]} />
          <Slider label="Amplitude" value={angle} min={2} max={45} step={1} unit="°" onChange={setAngle} />
          <div className="flex gap-2 pt-2">
            <button onClick={() => setRunning(r => !r)} className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
              {running ? "Pause" : "Run"}
            </button>
            <SaveProgressButton lab_slug="physics-pendulum" discipline="physics" completed score={Number(period.toFixed(3))} payload={{ length, gravity, angle, period }} />
          </div>
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">θ(t) over 2 periods</p>
          <svg viewBox="0 0 100 60" className="mt-2 h-32 w-full">
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.3" />
            <path d={path} fill="none" stroke="oklch(0.62 0.2 285)" strokeWidth="0.8" />
          </svg>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            T = 2π√(L/g) = 2π√({length.toFixed(2)}/{gravity.toFixed(2)}) ≈ {period.toFixed(3)} s
          </p>
        </div>
      }
    />
  );
}

export function TitrationLab() {
  // strong acid (HCl) + strong base (NaOH)
  const [acidConc] = useState(0.1); // M
  const [acidVol] = useState(25);   // mL
  const [baseConc, setBaseConc] = useState(0.1);
  const [baseVol, setBaseVol] = useState(0);   // mL added
  const moles_acid = (acidConc * acidVol) / 1000;
  const moles_base = (baseConc * baseVol) / 1000;
  const total_vol_L = (acidVol + baseVol) / 1000;

  let pH = 7;
  if (Math.abs(moles_acid - moles_base) < 1e-9) {
    pH = 7;
  } else if (moles_acid > moles_base) {
    const h = (moles_acid - moles_base) / total_vol_L;
    pH = -Math.log10(Math.max(h, 1e-14));
  } else {
    const oh = (moles_base - moles_acid) / total_vol_L;
    pH = 14 - -Math.log10(Math.max(oh, 1e-14));
  }
  pH = Math.max(0, Math.min(14, pH));

  // curve
  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 50; v += 0.25) {
      const mb = (baseConc * v) / 1000;
      const tv = (acidVol + v) / 1000;
      let p;
      if (Math.abs(moles_acid - mb) < 1e-9) p = 7;
      else if (moles_acid > mb) p = -Math.log10(Math.max((moles_acid - mb) / tv, 1e-14));
      else p = 14 - -Math.log10(Math.max((mb - moles_acid) / tv, 1e-14));
      const x = (v / 50) * 100;
      const y = 100 - (p / 14) * 100;
      pts.push(`${pts.length === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [acidVol, baseConc, moles_acid]);

  const equivVol = (moles_acid / baseConc) * 1000;

  // color: red (acid) → green (neutral) → blue (base)
  const indicatorColor =
    pH < 6 ? `oklch(0.7 0.2 ${20 + pH * 10})` :
    pH < 8 ? `oklch(0.78 0.18 145)` :
    `oklch(0.7 0.18 ${260 + (pH - 8) * 5})`;

  return (
    <LabShell
      title="Acid–Base Titration"
      discipline="chemistry"
      objectives={[
        "Find the equivalence point of HCl + NaOH.",
        "Read pH from the indicator and the curve.",
        "Equivalence: n(acid) = n(base).",
      ]}
      readouts={[
        ["pH", pH.toFixed(2)],
        ["NaOH added", `${baseVol.toFixed(1)} mL`],
        ["Equiv. point", `${equivVol.toFixed(1)} mL`],
      ]}
      canvas={
        <div className="relative grid h-full place-items-center">
          {/* Burette */}
          <div className="absolute left-1/2 top-4 h-40 w-3 -translate-x-1/2 rounded-b-sm border border-border bg-paper">
            <div className="absolute inset-x-0 bottom-0 rounded-b-sm bg-primary/40" style={{ height: `${100 - (baseVol / 50) * 100}%` }} />
          </div>
          <div className="absolute left-1/2 top-44 h-2 w-1 -translate-x-1/2 bg-border" />
          {/* Drop */}
          {baseVol > 0 && baseVol < 50 && (
            <div className="absolute left-1/2 top-48 h-2 w-2 -translate-x-1/2 animate-bounce rounded-full bg-primary" />
          )}
          {/* Flask */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <svg width="180" height="160" viewBox="0 0 180 160">
              <path d="M70 10 L110 10 L110 60 L160 140 Q160 155 145 155 L35 155 Q20 155 20 140 L70 60 Z"
                fill="oklch(0.99 0.005 300)" stroke="oklch(0.6 0.05 295)" strokeWidth="2" />
              <path d="M30 145 L150 145 L150 138 Q150 130 145 130 L120 130 L100 80 L100 60 L80 60 L80 80 L60 130 L35 130 Q30 130 30 138 Z"
                fill={indicatorColor} opacity="0.85" />
            </svg>
          </div>
        </div>
      }
      controls={
        <>
          <Slider label="NaOH added" value={baseVol} min={0} max={50} step={0.1} unit="mL" onChange={setBaseVol} />
          <Slider label="NaOH conc." value={baseConc} min={0.05} max={0.5} step={0.01} unit="M" onChange={setBaseConc} />
          <div className="rounded-md border border-border bg-paper p-3 text-xs">
            <p className="font-mono text-muted-foreground">In the flask</p>
            <p className="mt-1">{acidVol} mL of {acidConc} M HCl</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setBaseVol(0)} className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">Reset burette</button>
            <SaveProgressButton lab_slug="chemistry-titration" discipline="chemistry" completed={Math.abs(pH - 7) < 0.5} score={Math.max(0, 100 - Math.abs(pH - 7) * 10)} payload={{ pH, baseVol, baseConc }} />
          </div>
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Titration curve — pH vs volume</p>
          <svg viewBox="0 0 100 100" className="mt-2 h-40 w-full">
            <defs>
              <pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="oklch(0.9 0.02 295)" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#g)" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="oklch(0.7 0.05 295)" strokeDasharray="1,1" strokeWidth="0.3" />
            <path d={curve} fill="none" stroke="oklch(0.68 0.18 340)" strokeWidth="1.2" />
            <circle cx={(baseVol / 50) * 100} cy={100 - (pH / 14) * 100} r="1.4" fill="oklch(0.62 0.2 285)" />
          </svg>
        </div>
      }
    />
  );
}

export function PunnettLab() {
  const [p1, setP1] = useState("Aa");
  const [p2, setP2] = useState("Aa");
  const [trait, setTrait] = useState("Flower color");

  const split = (g: string) => [g[0], g[1]];
  const [a1, a2] = split(p1);
  const [b1, b2] = split(p2);
  const grid = [
    [order(a1, b1), order(a1, b2)],
    [order(a2, b1), order(a2, b2)],
  ];
  const counts: Record<string, number> = {};
  grid.flat().forEach((g) => (counts[g] = (counts[g] ?? 0) + 1));
  const phenoCounts = grid.flat().reduce<Record<string, number>>((acc, g) => {
    const ph = /[A-Z]/.test(g) ? "Dominant" : "Recessive";
    acc[ph] = (acc[ph] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <LabShell
      title="Punnett Square"
      discipline="biology"
      objectives={[
        "Predict offspring genotypes from two parent genotypes.",
        "Compare to phenotype ratio (with dominance).",
        "Try a monohybrid cross: Aa × Aa → 3:1.",
      ]}
      readouts={[
        ["Genotypes", Object.entries(counts).map(([g, n]) => `${n} ${g}`).join(" · ")],
        ["Phenotypes", Object.entries(phenoCounts).map(([p, n]) => `${n} ${p[0]}`).join(" : ")],
        ["Trait", trait],
      ]}
      canvas={
        <div className="grid h-full place-items-center p-6">
          <div className="grid grid-cols-[auto_repeat(2,1fr)] gap-2">
            <div />
            {[b1, b2].map((g, i) => (
              <div key={`h${i}`} className="rounded-md bg-biology/15 px-4 py-2 text-center font-display text-xl font-semibold text-biology">
                {g}
              </div>
            ))}
            {[a1, a2].map((row, r) => (
              <>
                <div key={`r${r}`} className="grid place-items-center rounded-md bg-biology/15 px-4 py-2 font-display text-xl font-semibold text-biology">{row}</div>
                {grid[r].map((cell, c) => {
                  const dom = /[A-Z]/.test(cell);
                  return (
                    <div key={`c${r}${c}`} className={`grid h-24 place-items-center rounded-md border-2 ${dom ? "border-biology bg-biology/10" : "border-border bg-muted"}`}>
                      <span className="font-display text-3xl font-bold">{cell}</span>
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      }
      controls={
        <>
          <ParentPicker label="Parent 1" value={p1} onChange={setP1} />
          <ParentPicker label="Parent 2" value={p2} onChange={setP2} />
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Trait label</label>
          <input value={trait} onChange={(e) => setTrait(e.target.value)} className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm" />
          <div className="flex gap-2 pt-2">
            <SaveProgressButton lab_slug="biology-punnett" discipline="biology" completed score={(phenoCounts["Dominant"] ?? 0) * 25} payload={{ p1, p2, counts, phenoCounts }} />
          </div>
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Phenotype ratio (assuming uppercase = dominant)</p>
          <div className="mt-3 flex h-6 overflow-hidden rounded-md border border-border">
            {Object.entries(phenoCounts).map(([k, v]) => (
              <div key={k} className={`grid place-items-center text-xs font-medium ${k === "Dominant" ? "bg-biology text-biology-foreground" : "bg-muted text-muted-foreground"}`} style={{ width: `${(v / 4) * 100}%` }}>
                {v}
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

function ParentPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const opts = ["AA", "Aa", "aa"];
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-1">
        {opts.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`rounded-md border px-2 py-2 font-display text-sm font-semibold ${value === o ? "border-biology bg-biology/15 text-biology" : "border-border bg-card hover:bg-secondary"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function order(a: string, b: string) {
  const arr = [a, b].sort((x, y) => (x.toLowerCase() === y.toLowerCase() ? (x < y ? -1 : 1) : x.toLowerCase() < y.toLowerCase() ? -1 : 1));
  return arr.join("");
}

function Slider({ label, value, min, max, step, unit, onChange, ticks }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void; ticks?: { at: number; label: string }[];
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
        <span className="font-mono text-sm">{value.toFixed(2)} <span className="text-muted-foreground">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary" />
      {ticks && (
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {ticks.map((t) => <span key={t.label}>{t.label}</span>)}
        </div>
      )}
    </div>
  );
}

function LabShell({
  title, discipline, objectives, readouts, canvas, controls, extra,
}: {
  title: string;
  discipline: "physics" | "chemistry" | "biology";
  objectives: string[];
  readouts: [string, string][];
  canvas: React.ReactNode;
  controls: React.ReactNode;
  extra?: React.ReactNode;
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
