import { useState } from "react";
import { PunnettLab } from "@/components/labs/SimComponents";
import { PhotosynthesisLab } from "@/components/labs/Photosynthesis";
import { OsmosisLab } from "@/components/labs/Osmosis";
import { EnzymeKineticsLab } from "@/components/labs/EnzymeKinetics";

const LABS = [
  { id: "punnett", label: "Punnett Square", component: PunnettLab, tag: "Genetics" },
  { id: "photosynthesis", label: "Photosynthesis", component: PhotosynthesisLab, tag: "Plants" },
  { id: "osmosis", label: "Osmosis", component: OsmosisLab, tag: "Transport" },
  { id: "enzymes", label: "Enzyme Kinetics", component: EnzymeKineticsLab, tag: "Biochem" },
];

export function BiologyPage() {
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
                    ? "bg-biology/15 text-biology"
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
