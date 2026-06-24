import { useEffect, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

export function OsmosisLab() {
  const [cellConc, setCellConc] = useState(0.3);     // mol/L inside cell
  const [solutionConc, setSolutionConc] = useState(0.1); // mol/L outside
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const diff = solutionConc - cellConc;
  const isHypotonic = diff < -0.05; // cell gains water → swells
  const isHypertonic = diff > 0.05;  // cell loses water → shrinks
  const isIsotonic = !isHypotonic && !isHypertonic;

  const netFlow = isHypotonic ? "into cell" : isHypertonic ? "out of cell" : "none (equilibrium)";

  useEffect(() => {
    if (running) {
      const id = setInterval(() => {
        setTime((t) => {
          if (t >= 100) { setRunning(false); return 100; }
          return t + 1;
        });
      }, 80);
      return () => clearInterval(id);
    }
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let lt = performance.now();

    const draw = (now: number) => {
      const dt = (now - lt) / 1000; lt = now;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      const prog = time / 100;
      // Cell radius changes over time
      const baseR = Math.min(W, H) * 0.22;
      const maxChange = baseR * 0.35 * Math.abs(diff) / 0.5;
      const cellR = isHypotonic
        ? baseR + maxChange * Math.min(1, prog * 1.5)
        : isHypertonic
        ? baseR - maxChange * Math.min(1, prog * 1.5)
        : baseR;

      // Solution (outside)
      ctx.fillStyle = `rgba(147,197,253,${0.08 + solutionConc * 0.3})`;
      ctx.fillRect(0, 0, W, H);

      // Cell membrane
      const memGrad = ctx.createRadialGradient(cx - cellR * 0.2, cy - cellR * 0.2, cellR * 0.1, cx, cy, cellR);
      memGrad.addColorStop(0, `rgba(187,247,208,${0.7 + cellConc * 0.3})`);
      memGrad.addColorStop(0.85, `rgba(134,239,172,0.8)`);
      memGrad.addColorStop(1, "rgba(34,197,94,0.9)");
      ctx.fillStyle = memGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cellR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, cellR, 0, Math.PI * 2);
      ctx.stroke();

      // Nucleus
      ctx.fillStyle = "rgba(21,128,61,0.6)";
      ctx.beginPath();
      ctx.arc(cx, cy, cellR * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Water molecules outside
      const outerN = Math.round((1 - solutionConc) * 20);
      for (let i = 0; i < outerN; i++) {
        const angle = (i / outerN) * Math.PI * 2 + now / 1500;
        const dist = cellR + 20 * dpr + (i % 3) * 15 * dpr;
        const mx = cx + dist * Math.cos(angle);
        const my = cy + dist * Math.sin(angle);
        ctx.fillStyle = "rgba(96,165,250,0.6)";
        ctx.beginPath();
        ctx.arc(mx, my, 5 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(96,165,250,0.4)";
        ctx.font = `${7 * dpr}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("H₂O", mx, my + 10 * dpr);
      }

      // Solute particles inside
      const innerN = Math.round(cellConc * 15);
      for (let i = 0; i < innerN; i++) {
        const angle = (i / innerN) * Math.PI * 2 + now / 2000;
        const dist = cellR * 0.5 + (i % 2) * cellR * 0.15;
        ctx.fillStyle = "rgba(239,68,68,0.7)";
        ctx.beginPath();
        ctx.arc(cx + dist * Math.cos(angle), cy + dist * Math.sin(angle), 4 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water flow arrows
      if (!isIsotonic && prog > 0) {
        const arrowCount = 6;
        for (let i = 0; i < arrowCount; i++) {
          const a = (i / arrowCount) * Math.PI * 2 + now / 2000;
          const fromR = isHypotonic ? cellR + 30 * dpr : cellR - 10 * dpr;
          const toR = isHypotonic ? cellR + 5 * dpr : cellR + 25 * dpr;
          const from = { x: cx + fromR * Math.cos(a), y: cy + fromR * Math.sin(a) };
          const to = { x: cx + toR * Math.cos(a), y: cy + toR * Math.sin(a) };
          ctx.strokeStyle = `rgba(59,130,246,${0.3 + Math.abs(diff) * 0.5})`;
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      }

      // Label
      const label = isHypotonic ? "Hypotonic → cell swells" : isHypertonic ? "Hypertonic → cell shrinks" : "Isotonic → equilibrium";
      const lc = isHypotonic ? "#16a34a" : isHypertonic ? "#dc2626" : "#6b7280";
      ctx.fillStyle = lc;
      ctx.font = `bold ${10 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(label, cx, H - 15 * dpr);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [cellConc, solutionConc, time, isHypotonic, isHypertonic, isIsotonic, diff]);

  return (
    <LabShell
      title="Osmosis"
      discipline="biology"
      labSlug="biology-osmosis"
      objectives={[
        "Define osmosis: water moves from low to high solute concentration.",
        "Predict hypotonic, hypertonic, isotonic outcomes.",
        "Link water potential (ψ) to solute concentration.",
      ]}
      readouts={[
        ["Cell conc.", `${cellConc.toFixed(2)} M`],
        ["Solution conc.", `${solutionConc.toFixed(2)} M`],
        ["Net flow", netFlow],
        ["ΔΨ", `${((solutionConc - cellConc) * (-2.27)).toFixed(2)} MPa`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <Slider label="Cell solute conc." value={cellConc} min={0.0} max={0.9} step={0.05} unit="M" onChange={(v) => { setTime(0); setCellConc(v); }} />
          <Slider label="Solution conc." value={solutionConc} min={0.0} max={0.9} step={0.05} unit="M" onChange={(v) => { setTime(0); setSolutionConc(v); }} />
          <div className={`rounded-md border px-3 py-2 text-xs font-medium ${isHypotonic ? "border-green-400 bg-green-50 text-green-800" : isHypertonic ? "border-red-400 bg-red-50 text-red-800" : "border-gray-300 bg-gray-50 text-gray-700"}`}>
            {isHypotonic ? "Hypotonic: cell gains water (swells)" : isHypertonic ? "Hypertonic: cell loses water (shrinks/plasmolysis)" : "Isotonic: no net movement"}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { setTime(0); setRunning(true); }}
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
            >
              {running ? "Running…" : "Simulate"}
            </button>
            <button onClick={() => { setTime(0); setRunning(false); }} className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">Reset</button>
          </div>
          <SaveProgressButton
            lab_slug="biology-osmosis"
            discipline="biology"
            completed={!isIsotonic && time >= 50}
            score={isIsotonic ? 100 : 0}
            payload={{ cellConc, solutionConc, isHypotonic, isHypertonic }}
          />
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Water potential: ψ = ψₛ + ψₚ</p>
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            <p>Solute potential ψₛ = −iCRT (lower inside when cell conc. is higher)</p>
            <p>Water moves from higher ψ → lower ψ (= from dilute → concentrated)</p>
            <p>ψ inside cell ≈ {(cellConc * -2.27).toFixed(2)} MPa · outside ≈ {(solutionConc * -2.27).toFixed(2)} MPa</p>
          </div>
        </div>
      }
    />
  );
}
