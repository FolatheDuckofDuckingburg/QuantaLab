import { useState } from "react";
import { PendulumLab } from "@/components/labs/SimComponents";
import { OhmsLawLab } from "@/components/labs/OhmsLaw";
import { ProjectileMotionLab } from "@/components/labs/ProjectileMotion";
import { WavePropertiesLab } from "@/components/labs/WaveProperties";

const LABS = [
  { id: "pendulum", label: "Simple Pendulum", component: PendulumLab, tag: "SHM" },
  { id: "ohms-law", label: "Ohm's Law", component: OhmsLawLab, tag: "Electricity" },
  { id: "projectile", label: "Projectile Motion", component: ProjectileMotionLab, tag: "Mechanics" },
  { id: "waves", label: "Wave Properties", component: WavePropertiesLab, tag: "Waves" },
];

export function PhysicsPage() {
  const [active, setActive] = useState(LABS[0].id);
  const Lab = LABS.find((l) => l.id === active)!.component;

  return (
    <div>
      {/* Lab picker */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {LABS.map((lab) => (
              <button
                key={lab.id}
                onClick={() => setActive(lab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === lab.id
                    ? "bg-physics/15 text-physics"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {lab.label}
                <span className="rounded px-1 py-0.5 text-[10px] font-normal bg-secondary text-muted-foreground">{lab.tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Lab />
    </div>
  );
}
