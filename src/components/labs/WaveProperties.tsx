import { useEffect, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

export function WavePropertiesLab() {
  const [frequency, setFrequency] = useState(2);   // Hz
  const [amplitude, setAmplitude] = useState(50);  // px
  const [wave2, setWave2] = useState(false);
  const [freq2, setFreq2] = useState(2);
  const [phase2, setPhase2] = useState(0);          // degrees
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const wavelength = 340 / frequency; // m (sound in air 340 m/s)
  const period = 1 / frequency;

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

    let t = 0;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      t += dt;

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const mid1 = wave2 ? H * 0.28 : H / 2;
      const mid2 = H * 0.72;
      const midS = H / 2;
      const amp = amplitude * dpr * 0.45;
      const k = (2 * Math.PI) / (W * 0.8);
      const omega = 2 * Math.PI * frequency;
      const omega2 = 2 * Math.PI * freq2;
      const phi2 = (phase2 * Math.PI) / 180;

      const drawWave = (midY: number, freq: number, om: number, phase: number, color: string, label: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        for (let px = 0; px < W; px++) {
          const x = px - W * 0.1;
          const y = midY + amp * Math.sin(k * x - om * t + phase);
          px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
        }
        ctx.stroke();
        // Center line
        ctx.strokeStyle = "rgba(150,150,150,0.3)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.setLineDash([4 * dpr, 4 * dpr]);
        ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.font = `bold ${9 * dpr}px sans-serif`;
        ctx.fillText(label, 8 * dpr, midY - amp - 6 * dpr);
      };

      if (wave2) {
        drawWave(mid1, frequency, omega, 0, "#6366f1", `Wave 1 · f=${frequency}Hz`);
        drawWave(mid2, freq2, omega2, phi2, "#ec4899", `Wave 2 · f=${freq2}Hz φ=${phase2}°`);

        // Superposition
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.5 * dpr;
        ctx.beginPath();
        for (let px = 0; px < W; px++) {
          const x = px - W * 0.1;
          const y1 = amp * Math.sin(k * x - omega * t);
          const y2 = amp * Math.sin(k * x - omega2 * t + phi2);
          const y = midS + (y1 + y2) / 2;
          px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
        }
        ctx.stroke();
        ctx.fillStyle = "#f59e0b";
        ctx.font = `bold ${9 * dpr}px sans-serif`;
        ctx.fillText("Superposition", 8 * dpr, midS - amp - 6 * dpr);
        ctx.strokeStyle = "rgba(150,150,150,0.3)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.setLineDash([4 * dpr, 4 * dpr]);
        ctx.beginPath(); ctx.moveTo(0, midS); ctx.lineTo(W, midS); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        drawWave(mid1, frequency, omega, 0, "#6366f1", `f = ${frequency} Hz`);
        // Wavelength arrow
        const wvPx = W * 0.8;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(W * 0.1, mid1 + amp + 14 * dpr);
        ctx.lineTo(W * 0.1 + wvPx, mid1 + amp + 14 * dpr);
        ctx.stroke();
        ctx.fillStyle = "#10b981";
        ctx.font = `${9 * dpr}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`λ = ${wavelength.toFixed(0)} m (v = 340 m/s)`, W / 2, mid1 + amp + 26 * dpr);
        ctx.textAlign = "left";
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [frequency, amplitude, wave2, freq2, phase2, wavelength]);

  const isDestructive = wave2 && Math.abs(frequency - freq2) < 0.1 && Math.abs(phase2 - 180) < 10;
  const isConstructive = wave2 && Math.abs(frequency - freq2) < 0.1 && Math.abs(phase2) < 10;

  return (
    <LabShell
      title="Wave Properties"
      discipline="physics"
      labSlug="physics-waves"
      objectives={[
        "Measure frequency, amplitude, and wavelength.",
        "Observe constructive and destructive interference.",
        "Verify v = fλ for waves.",
      ]}
      readouts={[
        ["Frequency", `${frequency.toFixed(1)} Hz`],
        ["Wavelength", `${wavelength.toFixed(0)} m`],
        ["Period", `${period.toFixed(3)} s`],
        ["Amplitude", `${amplitude} u`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <Slider label="Frequency 1" value={frequency} min={0.5} max={8} step={0.5} unit="Hz" onChange={setFrequency} />
          <Slider label="Amplitude" value={amplitude} min={10} max={100} step={5} unit="px" onChange={setAmplitude} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWave2((w) => !w)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${wave2 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}
            >
              {wave2 ? "Superposition ON" : "Add 2nd wave"}
            </button>
          </div>
          {wave2 && (
            <>
              <Slider label="Frequency 2" value={freq2} min={0.5} max={8} step={0.5} unit="Hz" onChange={setFreq2} />
              <Slider label="Phase shift" value={phase2} min={0} max={360} step={10} unit="°" onChange={setPhase2} />
              {isConstructive && <p className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">Constructive interference</p>}
              {isDestructive && <p className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">Destructive interference</p>}
            </>
          )}
          <div className="flex gap-2 pt-2">
            <SaveProgressButton
              lab_slug="physics-waves"
              discipline="physics"
              completed={isConstructive || isDestructive}
              score={isConstructive ? 100 : isDestructive ? 100 : 50}
              payload={{ frequency, amplitude, wave2, freq2, phase2 }}
            />
          </div>
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Wave equation: v = fλ</p>
          <div className="mt-2 grid grid-cols-3 gap-4 text-center text-xs">
            {[
              { label: "Speed (v)", val: "340 m/s", sub: "sound in air" },
              { label: "Frequency (f)", val: `${frequency} Hz`, sub: "cycles/sec" },
              { label: "Wavelength (λ)", val: `${wavelength.toFixed(0)} m`, sub: "v / f" },
            ].map(({ label, val, sub }) => (
              <div key={label} className="rounded-md border border-border bg-card p-2">
                <p className="font-mono text-muted-foreground">{label}</p>
                <p className="mt-1 font-display text-base font-bold">{val}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
