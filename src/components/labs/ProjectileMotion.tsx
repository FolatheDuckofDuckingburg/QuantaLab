import { useEffect, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

export function ProjectileMotionLab() {
  const [speed, setSpeed] = useState(20);    // m/s
  const [angleDeg, setAngle] = useState(45); // degrees
  const [gravity, setGravity] = useState(9.81);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const rafRef = useRef(0);

  const angle = (angleDeg * Math.PI) / 180;
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  const timeOfFlight = (2 * vy) / gravity;
  const maxHeight = (vy * vy) / (2 * gravity);
  const range = vx * timeOfFlight;

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

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (running) {
        timeRef.current += dt;
        if (timeRef.current > timeOfFlight + 0.5) {
          timeRef.current = 0;
          setRunning(false);
        }
      }

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Ground
      const groundY = H * 0.82;
      const originX = W * 0.08;
      const scale = Math.min((W * 0.84) / Math.max(range, 1), (groundY * 0.75) / Math.max(maxHeight, 1));

      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();

      // Trajectory path
      ctx.strokeStyle = "rgba(99,102,241,0.35)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.beginPath();
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * timeOfFlight;
        const px = originX + vx * t * scale;
        const py = groundY - (vy * t - 0.5 * gravity * t * t) * scale;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Projectile position
      const t = Math.min(timeRef.current, timeOfFlight);
      const bx = originX + vx * t * scale;
      const by = groundY - Math.max(0, vy * t - 0.5 * gravity * t * t) * scale;

      // Velocity vector
      const vtx = vx;
      const vty = Math.max(-30, vy - gravity * t);
      const vScale = scale * 0.15;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + vtx * vScale, by - vty * vScale);
      ctx.stroke();

      // Ball
      const grad = ctx.createRadialGradient(bx - 3 * dpr, by - 3 * dpr, 1, bx, by, 12 * dpr);
      grad.addColorStop(0, "#a5b4fc");
      grad.addColorStop(1, "#4f46e5");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, 10 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Range arrow at ground
      if (range > 0.1) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(originX, groundY + 10 * dpr);
        ctx.lineTo(originX + range * scale, groundY + 10 * dpr);
        ctx.stroke();
        ctx.fillStyle = "#10b981";
        ctx.font = `${9 * dpr}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`R = ${range.toFixed(1)} m`, originX + (range * scale) / 2, groundY + 22 * dpr);
      }

      // Max height line
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(originX, groundY - maxHeight * scale);
      ctx.lineTo(originX + (range / 2) * scale, groundY - maxHeight * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ec4899";
      ctx.font = `${8 * dpr}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(`H = ${maxHeight.toFixed(1)} m`, originX + 4 * dpr, groundY - maxHeight * scale - 4 * dpr);

      // Angle indicator
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.arc(originX, groundY, 28 * dpr, -angle, 0);
      ctx.stroke();
      ctx.fillStyle = "#6366f1";
      ctx.font = `${9 * dpr}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(`${angleDeg}°`, originX + 32 * dpr, groundY - 8 * dpr);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [speed, angleDeg, gravity, vx, vy, angle, timeOfFlight, maxHeight, range, running, angleDeg]);

  const reset = () => {
    timeRef.current = 0;
    setRunning(false);
  };

  return (
    <LabShell
      title="Projectile Motion"
      discipline="physics"
      labSlug="physics-projectile"
      objectives={[
        "Separate horizontal and vertical components of motion.",
        "Find angle for maximum range (45° on flat ground).",
        "Verify symmetry: time up = time down.",
      ]}
      readouts={[
        ["Range", `${range.toFixed(1)} m`],
        ["Max height", `${maxHeight.toFixed(1)} m`],
        ["Flight time", `${timeOfFlight.toFixed(2)} s`],
        ["vₓ", `${vx.toFixed(1)} m/s`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <Slider label="Initial speed" value={speed} min={5} max={40} step={1} unit="m/s" onChange={(v) => { reset(); setSpeed(v); }} />
          <Slider label="Launch angle" value={angleDeg} min={5} max={85} step={1} unit="°" onChange={(v) => { reset(); setAngle(v); }} />
          <Slider label="Gravity g" value={gravity} min={1.62} max={24.79} step={0.01} unit="m/s²" onChange={(v) => { reset(); setGravity(v); }}
            ticks={[{ at: 1.62, label: "Moon" }, { at: 9.81, label: "Earth" }, { at: 24.79, label: "Jupiter" }]} />
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { timeRef.current = 0; setRunning(true); }}
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
            >
              {running ? "Restart" : "Launch"}
            </button>
            <button onClick={reset} className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">Reset</button>
          </div>
          <SaveProgressButton
            lab_slug="physics-projectile"
            discipline="physics"
            completed={angleDeg === 45}
            score={Math.round(range)}
            payload={{ speed, angleDeg, gravity, range, maxHeight, timeOfFlight }}
          />
        </>
      }
      extra={
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-paper p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Equations of motion</p>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p>x(t) = {vx.toFixed(1)}t</p>
              <p>y(t) = {vy.toFixed(1)}t − ½({gravity})t²</p>
              <p>T = 2u·sin(θ)/g = {timeOfFlight.toFixed(2)} s</p>
              <p>R = u²·sin(2θ)/g = {range.toFixed(1)} m</p>
              <p>H = u²·sin²(θ)/(2g) = {maxHeight.toFixed(1)} m</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-paper p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Range vs angle (u={speed} m/s)</p>
            <svg viewBox="0 0 100 60" className="mt-2 h-28 w-full">
              <path
                d={Array.from({ length: 81 }, (_, i) => {
                  const a = ((i + 5) * Math.PI) / 180;
                  const r = (speed * speed * Math.sin(2 * a)) / gravity;
                  const maxR = (speed * speed) / gravity;
                  const x = ((i + 5) / 85) * 100;
                  const y = 55 - (r / maxR) * 50;
                  return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                }).join(" ")}
                fill="none" stroke="#6366f1" strokeWidth="1"
              />
              <circle
                cx={((angleDeg - 5) / 85) * 100}
                cy={55 - ((speed * speed * Math.sin(2 * angle)) / gravity / ((speed * speed) / gravity)) * 50}
                r="2" fill="#f59e0b"
              />
              <text x="50" y="62" fontSize="4.5" textAnchor="middle" fill="#9ca3af">Angle (°)</text>
            </svg>
          </div>
        </div>
      }
    />
  );
}
