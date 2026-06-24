import { useEffect, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

export function OhmsLawLab() {
  const [voltage, setVoltage] = useState(6);     // V
  const [resistance, setResistance] = useState(3); // Ω
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const current = voltage / resistance;           // A
  const power = voltage * current;                // W

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
      ctx.save();

      const cx = W / 2, cy = H / 2;
      const r = Math.min(W, H) * 0.32;

      // Circuit wire (rounded square)
      const t = cy - r, b = cy + r, l = cx - r, ri = cx + r;
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 3 * dpr;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(l, t + r * 0.3);
      ctx.lineTo(l, t);
      ctx.lineTo(ri, t);
      ctx.lineTo(ri, b);
      ctx.lineTo(l, b);
      ctx.lineTo(l, t + r * 0.8);
      ctx.stroke();

      // Battery on left side
      const bx = l, bcy = cy;
      drawBattery(ctx, bx, bcy, voltage, dpr);

      // Resistor on top
      drawResistor(ctx, cx, t, resistance, dpr);

      // Bulb on right — brightness from power
      drawBulb(ctx, ri, cy, power, dpr);

      // Ammeter on bottom
      drawAmmeter(ctx, cx, b, current, dpr);

      // Arrows showing current direction
      const arrowColor = `rgba(99,102,241,${Math.min(1, current / 5)})`;
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = 2 * dpr;
      drawArrow(ctx, cx + r * 0.3, t, -1, 0, dpr);
      drawArrow(ctx, ri, cy + r * 0.3, 0, 1, dpr);
      drawArrow(ctx, cx - r * 0.3, b, 1, 0, dpr);
      drawArrow(ctx, l, cy - r * 0.3, 0, -1, dpr);

      ctx.restore();
    }

    function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, v: number, dpr: number) {
      const h = 40 * dpr;
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(x - 6 * dpr, y - h / 2, 12 * dpr, h);
      // Plates
      for (let i = 0; i < Math.ceil(v / 3); i++) {
        const py = y - h / 2 + (i + 0.5) * (h / Math.ceil(v / 3));
        ctx.fillStyle = i % 2 === 0 ? "#818cf8" : "#6366f1";
        ctx.fillRect(x - 10 * dpr, py - 3 * dpr, 20 * dpr, 6 * dpr);
      }
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${11 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${v}V`, x, y + h / 2 + 15 * dpr);
    }

    function drawResistor(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, dpr: number) {
      const w = 60 * dpr, h = 18 * dpr;
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeRect(x - w / 2, y - h / 2, w, h);
      // Zig-zag inside
      ctx.beginPath();
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1.5 * dpr;
      const segs = 5;
      for (let i = 0; i <= segs; i++) {
        const rx = x - w / 2 + (i / segs) * w;
        const ry = y + (i % 2 === 0 ? -h / 4 : h / 4);
        i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
      }
      ctx.stroke();
      ctx.fillStyle = "#1e1b4b";
      ctx.font = `bold ${10 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${r}Ω`, x, y - h / 2 - 6 * dpr);
    }

    function drawBulb(ctx: CanvasRenderingContext2D, x: number, y: number, pwr: number, dpr: number) {
      const brightness = Math.min(1, pwr / 20);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 35 * dpr);
      glow.addColorStop(0, `rgba(253,224,71,${brightness})`);
      glow.addColorStop(1, "rgba(253,224,71,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 35 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(180,130,0,${0.3 + brightness * 0.7})`;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(x, y, 16 * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(253,224,71,${0.1 + brightness * 0.7})`;
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.font = `bold ${9 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${pwr.toFixed(1)}W`, x + 30 * dpr, y);
    }

    function drawAmmeter(ctx: CanvasRenderingContext2D, x: number, y: number, i: number, dpr: number) {
      ctx.beginPath();
      ctx.arc(x, y, 16 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "#f0fdf4";
      ctx.fill();
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();
      ctx.fillStyle = "#15803d";
      ctx.font = `bold ${9 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("A", x, y - 2 * dpr);
      ctx.font = `${8 * dpr}px sans-serif`;
      ctx.fillText(`${i.toFixed(2)}`, x, y + 10 * dpr);
    }

    function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, dpr: number) {
      const len = 12 * dpr;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx * len, y + dy * len);
      ctx.stroke();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
  }, [voltage, resistance, current, power]);

  // I-V graph data
  const ivPoints: string[] = [];
  for (let v = 0; v <= 12; v += 0.5) {
    const i = v / resistance;
    const x = (v / 12) * 100;
    const y = 100 - (i / 4) * 100;
    ivPoints.push(`${ivPoints.length === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(0, y).toFixed(1)}`);
  }
  const dotX = (voltage / 12) * 100;
  const dotY = Math.max(0, 100 - (current / 4) * 100);

  return (
    <LabShell
      title="Ohm's Law"
      discipline="physics"
      labSlug="physics-ohms-law"
      objectives={[
        "Verify V = IR using the virtual circuit.",
        "Observe how current changes with resistance.",
        "Calculate power dissipated: P = VI = I²R.",
      ]}
      readouts={[
        ["Voltage", `${voltage.toFixed(1)} V`],
        ["Current", `${current.toFixed(3)} A`],
        ["Power", `${power.toFixed(2)} W`],
        ["Resistance", `${resistance.toFixed(1)} Ω`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <Slider label="Voltage (V)" value={voltage} min={0.5} max={12} step={0.5} unit="V" onChange={setVoltage} />
          <Slider label="Resistance (R)" value={resistance} min={0.5} max={10} step={0.5} unit="Ω" onChange={setResistance} />
          <div className="rounded-md border border-border bg-paper p-3 font-mono text-xs space-y-1">
            <p>I = V / R = {voltage}/{resistance} = <strong>{current.toFixed(3)} A</strong></p>
            <p>P = V × I = {voltage} × {current.toFixed(3)} = <strong>{power.toFixed(2)} W</strong></p>
          </div>
          <div className="flex gap-2 pt-2">
            <SaveProgressButton
              lab_slug="physics-ohms-law"
              discipline="physics"
              completed
              score={Math.round(current * 100) / 100}
              payload={{ voltage, resistance, current, power }}
            />
          </div>
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">I–V characteristic (at R = {resistance}Ω)</p>
          <svg viewBox="0 0 100 100" className="mt-2 h-40 w-full">
            <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" className="text-border" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="100" stroke="currentColor" className="text-border" strokeWidth="0.5" />
            <path d={ivPoints.join(" ")} fill="none" stroke="#6366f1" strokeWidth="1.2" />
            <circle cx={dotX} cy={dotY} r="2" fill="#f59e0b" />
            <text x="50" y="108" fontSize="5" textAnchor="middle" fill="currentColor" className="text-muted-foreground">V (volts)</text>
            <text x="-30" y="50" fontSize="5" textAnchor="middle" fill="currentColor" className="text-muted-foreground" transform="rotate(-90,-30,50)">I (amps)</text>
          </svg>
        </div>
      }
    />
  );
}
