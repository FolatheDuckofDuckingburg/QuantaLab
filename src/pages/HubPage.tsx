import { useNavigate } from "react-router-dom";
import {
  FlaskConical, Atom, Leaf, GraduationCap,
  Zap, Target, TrendingUp, ChevronRight
} from "lucide-react";

const DISCIPLINES = [
  {
    path: "/physics",
    label: "Physics",
    color: "text-physics",
    border: "border-physics/20",
    bg: "bg-physics/10",
    icon: Atom,
    labs: ["Simple Pendulum", "Ohm's Law", "Projectile Motion", "Wave Properties"],
    desc: "Forces, energy, electricity, waves, and beyond.",
  },
  {
    path: "/chemistry",
    label: "Chemistry",
    color: "text-chemistry",
    border: "border-chemistry/20",
    bg: "bg-chemistry/10",
    icon: FlaskConical,
    labs: ["Acid–Base Titration", "Ideal Gas Laws", "Electrolysis"],
    desc: "Reactions, equilibrium, and atomic structure.",
  },
  {
    path: "/biology",
    label: "Biology",
    color: "text-biology",
    border: "border-biology/20",
    bg: "bg-biology/10",
    icon: Leaf,
    labs: ["Punnett Square", "Photosynthesis", "Osmosis", "Enzyme Kinetics"],
    desc: "Cells, genetics, ecology, and living systems.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time simulations",
    desc: "Drag sliders, twist dials — every graph updates instantly.",
  },
  {
    icon: Target,
    title: "IGCSE-aligned",
    desc: "Labs and questions mapped directly to the IGCSE syllabus.",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    desc: "Save lab results and exam scores, review them any time.",
  },
];

export function HubPage({ onSignIn }: { onSignIn: () => void }) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-chemistry/6 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            IGCSE-aligned · Sandbox + Practice
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            A virtual bench for{" "}
            <span className="text-physics">physics</span>
            {", "}
            <span className="text-chemistry">chemistry</span>
            {" & "}
            <span className="text-biology">biology</span>
            {"."}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Drag instruments, twist dials, watch real graphs draw themselves.
            Then test what you learned with IGCSE-style questions — progress saved across every lab.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/physics")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:shadow-lg"
            >
              <FlaskConical className="h-4 w-4" />
              Open a lab
            </button>
            <button
              onClick={() => navigate("/exam-prep")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              Practise IGCSE
            </button>
          </div>
        </div>
      </section>

      {/* Discipline cards */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {DISCIPLINES.map(({ path, label, color, border, bg, icon: Icon, labs, desc }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group relative overflow-hidden rounded-2xl border ${border} ${bg} p-6 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${border} bg-background`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h2 className={`font-display text-xl font-bold ${color}`}>{label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <ul className="mt-4 space-y-1">
                {labs.map((lab) => (
                  <li key={lab} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`h-1 w-1 rounded-full flex-shrink-0 ${color.replace("text-", "bg-")}`} />
                    {lab}
                  </li>
                ))}
              </ul>
              <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${color}`}>
                Open labs
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-10 text-center font-display text-2xl font-semibold">
          Built for IGCSE students
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to experiment?</h2>
          <p className="mt-2 text-muted-foreground">
            Create a free account to save your lab progress and track exam scores.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onSignIn}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Create free account
            </button>
            <button
              onClick={() => navigate("/physics")}
              className="rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Try without account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
