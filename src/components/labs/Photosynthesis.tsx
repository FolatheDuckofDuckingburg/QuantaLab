import { useEffect, useMemo, useRef, useState } from "react";
import { LabShell, Slider } from "./LabShell";
import { SaveProgressButton } from "@/components/SaveProgressButton";

function photosynthesisRate(light: number, co2: number, temp: number): number {
  // Simplified Blackman model — limiting factor = min of three curves
  const rLight = (light / 100) * 12;
  const rCO2 = (co2 / 0.04) * 10;
  const rTemp = temp < 10 ? (temp / 10) * 8 : temp < 35 ? 8 + (temp - 10) * 0.3 : Math.max(0, 8 + 25 * 0.3 - (temp - 35) * 1.5);
  return Math.max(0, Math.min(rLight, rCO2, rTemp));
}

export function PhotosynthesisLab() {
  const [light, setLight] = useState(50);     // % of max
  const [co2, setCO2] = useState(0.04);       // % concentration
  const [temp, setTemp] = useState(25);       // °C
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rate = photosynthesisRate(light, co2, temp);
  const limitingFactor =
    rate === photosynthesisRate(light - 5, co2, temp) ? "none" :
    rate < (light / 100) * 12 ? (rate < (co2 / 0.04) * 10 ? "CO₂" : "Temperature") : "Light";

  // Leaf animation with bubbles
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

    const bubbles: { x: number; y: number; r: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 30; i++) {
      bubbles.push({ x: 0.3 + Math.random() * 0.4, y: 0.5 + Math.random() * 0.4, r: 2 + Math.random() * 4, speed: 0.3 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2 });
    }

    let t = 0, raf = 0, last = performance.now();

    const draw = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      t += dt;

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient based on light level
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      const lc = Math.floor((light / 100) * 255);
      sky.addColorStop(0, `rgba(${255 - lc / 3},${200 + lc / 10},${lc},0.3)`);
      sky.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.5);

      // Sun
      const sunBrightness = light / 100;
      ctx.fillStyle = `rgba(253,224,71,${sunBrightness})`;
      ctx.beginPath();
      ctx.arc(W * 0.75, H * 0.18, 30 * dpr * sunBrightness, 0, Math.PI * 2);
      ctx.fill();
      // Rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.strokeStyle = `rgba(253,224,71,${sunBrightness * 0.6})`;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(W * 0.75 + 35 * dpr * Math.cos(angle), H * 0.18 + 35 * dpr * Math.sin(angle));
        ctx.lineTo(W * 0.75 + 50 * dpr * Math.cos(angle), H * 0.18 + 50 * dpr * Math.sin(angle));
        ctx.stroke();
      }

      // Leaf
      const leafX = W * 0.5, leafY = H * 0.55;
      const leafW = W * 0.32, leafH = H * 0.3;
      ctx.save();
      ctx.translate(leafX, leafY);
      const greenIntensity = Math.min(1, rate / 12);
      ctx.fillStyle = `rgb(${Math.floor(20 + (1 - greenIntensity) * 80)},${Math.floor(120 + greenIntensity * 100)},${Math.floor(20 + greenIntensity * 30)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, leafW / 2, leafH / 2, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      // Veins
      ctx.strokeStyle = `rgba(0,${Math.floor(90 + greenIntensity * 50)},0,0.4)`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(-leafW / 2 + 10 * dpr, 0); ctx.lineTo(leafW / 2 - 10 * dpr, 0); ctx.stroke();
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 20 * dpr, 0);
        ctx.lineTo(i * 20 * dpr + 20 * dpr * Math.sign(i || 1), -leafH * 0.35);
        ctx.stroke();
      }
      ctx.restore();

      // O₂ bubbles rising
      const activeBubbles = Math.ceil(rate / 2);
      bubbles.slice(0, activeBubbles).forEach((b) => {
        b.y -= b.speed * dt * 0.15;
        if (b.y < 0) { b.y = 0.6 + Math.random() * 0.3; b.x = 0.35 + Math.random() * 0.3; }
        const bx = b.x * W, by = b.y * H;
        ctx.strokeStyle = `rgba(147,197,253,${0.6 - b.y * 0.5})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.arc(bx, by, b.r * dpr, 0, Math.PI * 2);
        ctx.stroke();
        if (b.y < 0.3) {
          ctx.fillStyle = "#6ee7b7";
          ctx.font = `${7 * dpr}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("O₂", bx, by - b.r * dpr - 2);
        }
      });

      // CO₂ arrows descending
      const co2Arrows = Math.ceil((co2 / 0.04) * 3);
      for (let i = 0; i < co2Arrows; i++) {
        const ax = W * (0.2 + i * 0.2);
        const ay = H * 0.2 + ((t * 40 * dpr + i * 50 * dpr) % (H * 0.35));
        ctx.fillStyle = "rgba(107,114,128,0.5)";
        ctx.font = `${8 * dpr}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("CO₂", ax, ay);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [light, co2, temp, rate]);

  // Light response curve
  const lightCurve = useMemo(() =>
    Array.from({ length: 101 }, (_, i) => {
      const r = photosynthesisRate(i, co2, temp);
      return `${i === 0 ? "M" : "L"}${i},${(55 - (r / 15) * 50).toFixed(1)}`;
    }).join(" "), [co2, temp]);

  return (
    <LabShell
      title="Photosynthesis Rate"
      discipline="biology"
      labSlug="biology-photosynthesis"
      objectives={[
        "Identify the limiting factor (Blackman's Law).",
        "Plot rate vs. light intensity — note compensation point.",
        "Observe the effect of temperature on enzyme-driven reactions.",
      ]}
      readouts={[
        ["Rate", `${rate.toFixed(1)} μmol O₂/s`],
        ["Limiting factor", limitingFactor || "Light"],
        ["Light", `${light}%`],
        ["CO₂", `${(co2 * 100).toFixed(3)}%`],
      ]}
      canvas={<canvas ref={canvasRef} className="h-full w-full" />}
      controls={
        <>
          <Slider label="Light intensity" value={light} min={0} max={100} step={5} unit="%" onChange={setLight} />
          <Slider label="CO₂ conc." value={co2} min={0.005} max={0.1} step={0.005} unit="%" onChange={setCO2} />
          <Slider label="Temperature" value={temp} min={0} max={50} step={1} unit="°C" onChange={setTemp}
            ticks={[{ at: 0, label: "0°C" }, { at: 25, label: "Opt." }, { at: 50, label: "50°C" }]} />
          <div className={`rounded-md border px-3 py-2 text-xs ${limitingFactor === "Light" ? "border-yellow-400 bg-yellow-50 text-yellow-800" : limitingFactor === "CO₂" ? "border-gray-400 bg-gray-50 text-gray-700" : "border-red-400 bg-red-50 text-red-800"}`}>
            Limiting factor: <strong>{limitingFactor || "Light"}</strong>
          </div>
          <SaveProgressButton
            lab_slug="biology-photosynthesis"
            discipline="biology"
            completed={rate > 10}
            score={Math.round(rate * 10)}
            payload={{ light, co2, temp, rate }}
          />
        </>
      }
      extra={
        <div className="rounded-lg border border-border bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Rate vs light intensity</p>
          <svg viewBox="0 0 100 60" className="mt-2 h-36 w-full">
            <path d={lightCurve} fill="none" stroke="#16a34a" strokeWidth="1.2" />
            <circle cx={light} cy={(55 - (rate / 15) * 50)} r="2.5" fill="#f59e0b" />
            <line x1="0" y1="55" x2="100" y2="55" stroke="#d1d5db" strokeWidth="0.5" />
            <text x="50" y="62" fontSize="4.5" textAnchor="middle" fill="#9ca3af">Light intensity (%)</text>
            <text x="-2" y="30" fontSize="4.5" textAnchor="middle" fill="#9ca3af" transform="rotate(-90,-2,30)">Rate</text>
          </svg>
        </div>
      }
    />
  );
}
