import { useMemo, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

function mmRate(S: number, Vmax: number, Km: number): number {
  return (Vmax * S) / (Km + S);
}

export function EnzymeKineticsLab() {
  const [substrate, setSubstrate] = useState(5);   // mM
  const [temp, setTemp] = useState(37);              // °C
  const [pH, setPH] = useState(7);
  const [inhibitor, setInhibitor] = useState(false);
  const [inhibitorConc, setInhibitorConc] = useState(2); // mM

  // Optimal temp = 37°C (enzyme activity bell curve), optimal pH = 7
  const tempFactor = Math.max(0, 1 - Math.abs(temp - 37) ** 1.8 / 1000);
  const pHFactor = Math.max(0, 1 - (pH - 7) ** 2 / 9);
  const Vmax = 10 * tempFactor * pHFactor;
  const Km = 3; // mM (baseline)

  // Competitive inhibition: apparent Km increases
  const Ki = 5;
  const Km_app = inhibitor ? Km * (1 + inhibitorConc / Ki) : Km;

  const rate = mmRate(substrate, Vmax, Km_app);

  // Michaelis-Menten curve
  const curvePath = useMemo(() =>
    Array.from({ length: 101 }, (_, i) => {
      const s = i * 0.2;
      const r = mmRate(s, Vmax, Km_app);
      const x = (s / 20) * 100;
      const y = 55 - (r / 11) * 50;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(0, y).toFixed(1)}`;
    }).join(" "), [Vmax, Km_app]);

  const normalPath = useMemo(() =>
    Array.from({ length: 101 }, (_, i) => {
      const s = i * 0.2;
      const r = mmRate(s, Vmax, Km);
      const x = (s / 20) * 100;
      const y = 55 - (r / 11) * 50;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(0, y).toFixed(1)}`;
    }).join(" "), [Vmax, Km]);

  const dotX = (substrate / 20) * 100;
  const dotY = 55 - (rate / 11) * 50;

  // Lineweaver-Burk: 1/v vs 1/[S]
  const lbPath = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => {
      const s = 0.5 + i * 0.5;
      const v = mmRate(s, Vmax, Km_app);
      if (v < 0.01) return null;
      const x = 10 + (1 / s) * 30;
      const y = 50 - (1 / v) * 20;
      return `${i === 0 ? "M" : "L"}${Math.min(100, x).toFixed(1)},${Math.max(0, y).toFixed(1)}`;
    }).filter(Boolean).join(" "), [Vmax, Km_app]);

  return (
    <LabShell
      title="Enzyme Kinetics"
      discipline="biology"
      labSlug="biology-enzymes"
      objectives={[
        "Plot Michaelis-Menten curve and read Vmax and Km.",
        "Observe competitive inhibition (apparent Km rises).",
        "Understand how pH and temperature denature enzymes.",
      ]}
      readouts={[
        ["Rate (v)", `${rate.toFixed(2)} mM/s`],
        ["Vmax", `${Vmax.toFixed(2)} mM/s`],
        ["Km", `${Km_app.toFixed(2)} mM`],
        ["½Vmax at", `${(Km_app).toFixed(2)} mM`],
      ]}
      canvas={
        <div className="grid h-full place-items-center p-4">
          <div className="w-full space-y-3">
            {/* Michaelis-Menten plot */}
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-center">Michaelis-Menten curve</p>
            <svg viewBox="0 0 100 60" className="h-44 w-full">
              <line x1="0" y1="55" x2="100" y2="55" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="55" stroke="#e5e7eb" strokeWidth="0.5" />
              {/* Vmax line */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="#e5e7eb" strokeDasharray="2,2" strokeWidth="0.5" />
              <text x="1" y="4" fontSize="3.5" fill="#9ca3af">Vmax={Vmax.toFixed(1)}</text>
              {/* ½Vmax */}
              <line x1="0" y1="30" x2={dotX} y2="30" stroke="#d1d5db" strokeDasharray="1,1" strokeWidth="0.5" />
              <line x1={dotX} y1="30" x2={dotX} y2="55" stroke="#d1d5db" strokeDasharray="1,1" strokeWidth="0.5" />
              {inhibitor && (
                <path d={normalPath} fill="none" stroke="#93c5fd" strokeWidth="0.8" strokeDasharray="2,2" />
              )}
              <path d={curvePath} fill="none" stroke="#16a34a" strokeWidth="1.2" />
              <circle cx={dotX} cy={dotY} r="2" fill="#f59e0b" />
              <text x="50" y="62" fontSize="3.5" textAnchor="middle" fill="#9ca3af">[S] (mM)</text>
              <text x="-2" y="28" fontSize="3.5" textAnchor="middle" fill="#9ca3af" transform="rotate(-90,-2,28)">v (mM/s)</text>
              {inhibitor && <text x="90" y="28" fontSize="3.5" fill="#93c5fd">+ Inhibitor</text>}
            </svg>
            {/* Lineweaver-Burk */}
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-center">Lineweaver–Burk (double reciprocal)</p>
            <svg viewBox="0 0 100 60" className="h-32 w-full">
              <line x1="10" y1="0" x2="10" y2="55" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
              <path d={lbPath} fill="none" stroke="#7c3aed" strokeWidth="1.2" />
              <text x="55" y="58" fontSize="3.5" textAnchor="middle" fill="#9ca3af">1/[S]</text>
              <text x="5" y="25" fontSize="3.5" textAnchor="middle" fill="#9ca3af" transform="rotate(-90,5,25)">1/v</text>
            </svg>
          </div>
        </div>
      }
      controls={
        <>
          <Slider label="[Substrate]" value={substrate} min={0.1} max={20} step={0.1} unit="mM" onChange={setSubstrate} />
          <Slider label="Temperature" value={temp} min={0} max={70} step={1} unit="°C" onChange={setTemp}
            ticks={[{ at: 0, label: "0°C" }, { at: 37, label: "37°C" }, { at: 70, label: "70°C" }]} />
          <Slider label="pH" value={pH} min={1} max={13} step={0.5} unit="" onChange={setPH}
            ticks={[{ at: 1, label: "Acid" }, { at: 7, label: "Neutral" }, { at: 13, label: "Base" }]} />
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Competitive inhibitor</label>
            <button
              onClick={() => setInhibitor((i) => !i)}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${inhibitor ? "border-red-400 bg-red-50 text-red-700" : "border-border bg-card hover:bg-secondary"}`}
            >
              {inhibitor ? "ON" : "OFF"}
            </button>
          </div>
          {inhibitor && (
            <Slider label="Inhibitor conc." value={inhibitorConc} min={0.5} max={10} step={0.5} unit="mM" onChange={setInhibitorConc} />
          )}
          <div className="rounded-md border border-border bg-paper p-3 font-mono text-xs">
            <p>v = Vmax·[S] / (Km + [S])</p>
            <p>= {Vmax.toFixed(2)}·{substrate} / ({Km_app.toFixed(2)}+{substrate})</p>
            <p>= <strong>{rate.toFixed(3)} mM/s</strong></p>
          </div>
          <SaveProgressButton
            lab_slug="biology-enzymes"
            discipline="biology"
            completed={inhibitor}
            score={Math.round(rate * 10)}
            payload={{ substrate, temp, pH, inhibitor, inhibitorConc, rate, Vmax, Km: Km_app }}
          />
        </>
      }
    />
  );
}
