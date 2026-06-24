import { useState } from "react";
import { TitrationLab } from "@/components/labs/SimComponents";
import { GasLawsLab } from "@/components/labs/GasLaws";
import { ElectrolysisLab } from "@/components/labs/Electrolysis";

const LABS = [
  { id: "titration", label: "Acid–Base Titration", component: TitrationLab, tag: "Acids" },
  { id: "gas-laws", label: "Ideal Gas Laws", component: GasLawsLab, tag: "Gases" },
  { id: "electrolysis", label: "Electrolysis", component: ElectrolysisLab, tag: "Redox" },
];

export function ChemistryPage() {
  const [active, setActive] = useState(LABS[0].id);
  const Lab = LABS.find((l) => l.id === active)!.component;

  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {LABS.map((lab) => (
              <button
                key={lab.id}
                onClick={() => setActive(lab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === lab.id
                    ? "bg-chemistry/15 text-chemistry"
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
