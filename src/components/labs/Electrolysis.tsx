import { useEffect, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

const METALS: Record<string, { M: number; n: number; symbol: string; color: string }> = {
  Copper: { M: 63.5, n: 2, symbol: "Cu²⁺", color: "#b45309" },
  Silver: { M: 107.9, n: 1, symbol: "Ag⁺", color: "#9ca3af" },
  Zinc: { M: 65.4, n: 2, symbol: "Zn²⁺", color: "#6b7280" },
  Nickel: { M: 58.7, n: 2, symbol: "Ni²⁺", color: "#065f46" },
};

export function ElectrolysisLab() {
  const [current, setCurrent] = useState(2);      // A
  const [timeSec, setTime] = useState(60);         // s
  const [metalKey, setMetal] = useState("Copper");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const metal = METALS[metalKey];
  const F = 96485; // C/mol
  const charge = current * timeSec;
  const moles = charge / (metal.n * F);
  const mass = moles * metal.M;

  const elapsedCharge = current * elapsed;
  const elapsedMoles = elapsedCharge / (metal.n * F);
  const elapsedMass = elapsedMoles * metal.M;

  const startStop = () => {
    if (running) {
      clearInterval(intervalRef.current!);
      setRunning(false);
    } else {
      setElapsed(0);
      setRunning(true);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= timeSec) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            return timeSec;
          }
          return e + 0.5;
        });
      }, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeSec]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const { width, height } = ctx.canvas.getBoundingClientRect();
      ctx.canvas.width = width * dpr;
      ctx.canvas.height = height * dpr;
      draw();
    };

    function draw() {
      const W = ctx.canvas.width, H = ctx.canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      // Electrolytic cell body
      const cellW = W * 0.55, cellH = H * 0.5;
      const cellX = cx - cellW / 2, cellY = cy - cellH / 2;

      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(cellX, cellY, cellW, cellH);

      // Electrolyte fill
      ctx.fillStyle = `rgba(${metalKey === "Copper" ? "180,91,9" : metalKey === "Silver" ? "156,163,175" : metalKey === "Zinc" ? "107,114,128" : "6,95,70"},0.12)`;
      ctx.fillRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2);

      // Electrodes
      const eH = cellH * 0.75;
      const cathodeX = cx - cellW * 0.25;
      const anodeX = cx + cellW * 0.25;

      // Cathode (-)
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(cathodeX - 6 * dpr, cellY + cellH * 0.1, 12 * dpr, eH);
      ctx.fillStyle = metal.color;
      const depositH = Math.min(eH * 0.8, (elapsedMass / mass) * eH * 0.8);
      if (depositH > 0) {
        ctx.fillRect(cathodeX - 8 * dpr, cellY + cellH * 0.1 + eH - depositH, 16 * dpr, depositH);
      }
      ctx.fillStyle = "#1e293b";
      ctx.font = `bold ${9 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("−", cathodeX, cellY + cellH * 0.1 - 8 * dpr);
      ctx.fillText("Cathode", cathodeX, cellY + cellH + 14 * dpr);

      // Anode (+)
      ctx.fillStyle = "#374151";
      ctx.fillRect(anodeX - 6 * dpr, cellY + cellH * 0.1, 12 * dpr, eH);
      ctx.fillStyle = "#1e293b";
      ctx.fillText("+", anodeX, cellY + cellH * 0.1 - 8 * dpr);
      ctx.fillText("Anode", anodeX, cellY + cellH + 14 * dpr);

      // Bubbles / ions moving
      const t = Date.now() / 1000;
      for (let i = 0; i < 8; i++) {
        const phase = (i / 8) * Math.PI * 2;
        const bx = cathodeX + 20 * dpr * Math.sin(t * 2 + phase);
        const by = cellY + cellH * 0.8 - ((t * 30 * dpr + i * 20 * dpr) % (cellH * 0.7));
        ctx.fillStyle = `rgba(${metalKey === "Copper" ? "180,91,9" : "99,102,241"},0.6)`;
        ctx.beginPath();
        ctx.arc(bx, by, 3 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wire + battery above
      const wireY = cellY - 30 * dpr;
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(cathodeX, cellY); ctx.lineTo(cathodeX, wireY);
      ctx.lineTo(anodeX, wireY); ctx.lineTo(anodeX, cellY);
      ctx.stroke();
      // Battery symbol
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 2 * dpr;
      const bx2 = cx, by2 = wireY;
      for (let p = 0; p < 3; p++) {
        const px = bx2 - 12 * dpr + p * 12 * dpr;
        ctx.beginPath();
        ctx.moveTo(px, by2 - 6 * dpr); ctx.lineTo(px, by2 + 6 * dpr); ctx.stroke();
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(px + 6 * dpr, by2 - 4 * dpr); ctx.lineTo(px + 6 * dpr, by2 + 4 * dpr); ctx.stroke();
        ctx.lineWidth = 2 * dpr;
      }
      ctx.fillStyle = "#7c3aed";
      ctx.font = `${9 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${current}A`, cx, wireY - 10 * dpr);

      // Progress indicator
      const prog = elapsed / timeSec;
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(cellX, cellY + cellH + 28 * dpr, cellW, 6 * dpr);
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(cellX, cellY + cellH + 28 * dpr, cellW * prog, 6 * dpr);
    }

    let raf = 0;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [current, timeSec, metalKey, elapsed, elapsedMass, mass, metal, running]);

  return (
    <LabShell
      title="Electrolysis (Faraday's Laws)"
      discipline="chemistry"
      labSlug="chemistry-electrolysis"
      objectives={[
        "Apply Faraday's First Law: m = (Q × M) / (n × F).",
        "Compare metals with different valencies.",
        "Calculate charge Q = It.",
      ]}
      readouts={[
        ["Charge (Q)", `${(current * elapsed).toFixed(0)} C`],
        ["Mass deposited", `${elapsedMass.toFixed(4)} g`],
        ["Final mass", `${mass.toFixed(4)} g`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Metal ion</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.keys(METALS).map((m) => (
                <button key={m} onClick={() => setMetal(m)}
                  className={`rounded-md border px-2 py-1.5 text-xs font-medium ${metalKey === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}>
                  {m} ({METALS[m].symbol})
                </button>
              ))}
            </div>
          </div>
          <Slider label="Current (I)" value={current} min={0.5} max={5} step={0.5} unit="A" onChange={setCurrent} />
          <Slider label="Time (t)" value={timeSec} min={10} max={300} step={10} unit="s" onChange={setTime} />
          <div className="rounded-md border border-border bg-paper p-3 font-mono text-xs space-y-1">
            <p>Q = It = {current}×{timeSec} = {charge.toFixed(0)} C</p>
            <p>m = QM/(nF) = {mass.toFixed(5)} g</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={startStop} className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
              {running ? "Stop" : elapsed > 0 ? "Restart" : "Run"}
            </button>
            <SaveProgressButton
              lab_slug="chemistry-electrolysis"
              discipline="chemistry"
              completed={elapsed >= timeSec}
              score={Math.round(elapsedMass * 1000)}
              payload={{ metal: metalKey, current, timeSec, mass }}
            />
          </div>
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Mass deposited vs time</p>
          <svg viewBox="0 0 100 60" className="mt-2 h-28 w-full">
            <path
              d={Array.from({ length: 101 }, (_, i) => {
                const t2 = (i / 100) * timeSec;
                const m2 = (current * t2 * metal.M) / (metal.n * F);
                const x = i;
                const y = 55 - (m2 / mass) * 50;
                return `${i === 0 ? "M" : "L"}${x},${y.toFixed(1)}`;
              }).join(" ")}
              fill="none" stroke="#7c3aed" strokeWidth="1"
            />
            <circle
              cx={Math.min(100, (elapsed / timeSec) * 100)}
              cy={55 - (elapsedMass / mass) * 50}
              r="2" fill="#f59e0b"
            />
          </svg>
        </div>
      }
    />
  );
}
