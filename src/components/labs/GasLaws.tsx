import { useEffect, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

type Mode = "boyle" | "charles" | "gay-lussac";

export function GasLawsLab() {
  const [mode, setMode] = useState<Mode>("boyle");
  const [pressure, setPressure] = useState(100);   // kPa
  const [volume, setVolume] = useState(10);         // L
  const [temp, setTemp] = useState(300);            // K
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // n fixed at 1 mol, R = 8.314 J/(mol·K)
  const R = 8.314;
  const n = 1;

  // Derive the third variable from the other two based on mode
  let derivedP = pressure, derivedV = volume, derivedT = temp;
  if (mode === "boyle") {
    // T constant, P*V = nRT
    const nRT = n * R * temp;
    derivedV = nRT / pressure / 1000; // P in kPa → Pa ×1000 then / 1000 for L
  } else if (mode === "charles") {
    // P constant, V/T = nR/P
    derivedT = (pressure * 1000 * volume) / (n * R);
    derivedV = volume;
  } else {
    // V constant, P/T = nR/V
    derivedP = (n * R * temp) / (volume * 0.001) / 1000; // Pa → kPa
  }

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const N = Math.min(40, Math.round(20 + derivedP / 10));
    const particles = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
    }));

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const speedFactor = Math.sqrt(derivedT / 300);
    let raf = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Container — shrinks with pressure (Boyle's law visual)
      const containerW = Math.min(0.7, Math.max(0.2, 10 / (derivedP / 10))) * W;
      const containerH = H * 0.7;
      const cx = W / 2, cy = H / 2;
      const left = cx - containerW / 2, top = cy - containerH / 2;

      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 3 * dpr;
      ctx.strokeRect(left, top, containerW, containerH);

      // Piston (moves based on volume)
      const pistonX = left + containerW;
      ctx.fillStyle = "rgba(124,58,237,0.15)";
      ctx.fillRect(left, top, containerW, containerH);

      // Particles
      const speed = speedFactor * 0.004;
      particles.forEach((p) => {
        p.x += p.vx * speed / 0.002;
        p.y += p.vy * speed / 0.002;
        if (p.x < 0 || p.x > 1) { p.vx *= -1; p.x = Math.max(0, Math.min(1, p.x)); }
        if (p.y < 0 || p.y > 1) { p.vy *= -1; p.y = Math.max(0, Math.min(1, p.y)); }

        const px = left + p.x * containerW;
        const py = top + p.y * containerH;
        const c = ctx.createRadialGradient(px, py, 0, px, py, 5 * dpr);
        c.addColorStop(0, "#c4b5fd");
        c.addColorStop(1, "#7c3aed");
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(px, py, 5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Labels
      ctx.fillStyle = "#6b7280";
      ctx.font = `${9 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`P = ${derivedP.toFixed(1)} kPa`, cx, top - 8 * dpr);
      ctx.fillText(`V = ${derivedV.toFixed(2)} L`, cx, top + containerH + 18 * dpr);
      ctx.fillText(`T = ${derivedT.toFixed(0)} K`, cx, top + containerH + 30 * dpr);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [derivedP, derivedT, derivedV]);

  const modeBtn = (m: Mode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={`flex-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors ${mode === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}
    >
      {label}
    </button>
  );

  // PV graph data for Boyle's law
  const pvPath = Array.from({ length: 100 }, (_, i) => {
    const p = 20 + i * 2;
    const v = (n * R * derivedT) / (p * 1000) * 1000;
    const x = ((p - 20) / 180) * 100;
    const y = 100 - (v / 30) * 100;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(0, Math.min(100, y)).toFixed(1)}`;
  }).join(" ");

  return (
    <LabShell
      title="Ideal Gas Laws"
      discipline="chemistry"
      labSlug="chemistry-gas-laws"
      objectives={[
        "Boyle's Law: P₁V₁ = P₂V₂ at constant T.",
        "Charles's Law: V/T = constant at constant P.",
        "Gay-Lussac's: P/T = constant at constant V.",
      ]}
      readouts={[
        ["Pressure", `${derivedP.toFixed(1)} kPa`],
        ["Volume", `${derivedV.toFixed(2)} L`],
        ["Temperature", `${derivedT.toFixed(0)} K`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <div className="flex gap-1">
            {modeBtn("boyle", "Boyle's (T fixed)")}
            {modeBtn("charles", "Charles's (P fixed)")}
            {modeBtn("gay-lussac", "Gay-Lussac (V fixed)")}
          </div>
          {(mode === "boyle" || mode === "gay-lussac") && (
            <Slider label="Pressure (P)" value={pressure} min={20} max={200} step={5} unit="kPa" onChange={setPressure} />
          )}
          {(mode === "boyle" || mode === "charles") && (
            <Slider label="Volume (V)" value={volume} min={1} max={30} step={0.5} unit="L" onChange={setVolume} />
          )}
          {(mode === "charles" || mode === "gay-lussac") && (
            <Slider label="Temperature (T)" value={temp} min={100} max={600} step={10} unit="K" onChange={setTemp}
              ticks={[{ at: 100, label: "100K" }, { at: 273, label: "0°C" }, { at: 600, label: "600K" }]} />
          )}
          <div className="rounded-md border border-border bg-paper p-3 font-mono text-xs">
            <p>PV = nRT</p>
            <p>{derivedP.toFixed(1)} × {derivedV.toFixed(2)} = 1 × 8.314 × {derivedT.toFixed(0)}</p>
            <p className="font-bold">{(derivedP * 1000 * derivedV / 1000).toFixed(0)} ≈ {(n * R * derivedT).toFixed(0)} J</p>
          </div>
          <SaveProgressButton
            lab_slug="chemistry-gas-laws"
            discipline="chemistry"
            completed
            score={Math.round(derivedP)}
            payload={{ mode, pressure: derivedP, volume: derivedV, temp: derivedT }}
          />
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">P–V isotherm (Boyle's Law at T={derivedT.toFixed(0)}K)</p>
          <svg viewBox="0 0 100 100" className="mt-2 h-36 w-full">
            <path d={pvPath} fill="none" stroke="#7c3aed" strokeWidth="1.2" />
            <circle
              cx={((derivedP - 20) / 180) * 100}
              cy={Math.max(0, Math.min(100, 100 - (derivedV / 30) * 100))}
              r="2.5" fill="#f59e0b"
            />
            <text x="50" y="108" fontSize="5" textAnchor="middle" fill="#9ca3af">Pressure (kPa)</text>
            <text x="-30" y="50" fontSize="5" textAnchor="middle" fill="#9ca3af" transform="rotate(-90,-30,50)">Volume (L)</text>
          </svg>
        </div>
      }
    />
  );
}
