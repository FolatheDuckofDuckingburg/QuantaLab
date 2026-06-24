import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LabRun {
  id: string;
  lab_slug: string;
  discipline: string;
  score: number | null;
  completed: boolean;
  created_at: string;
}

interface ExamAttempt {
  id: string;
  topic: string;
  discipline: string;
  score: number;
  total: number;
  created_at: string;
}

const DISCIPLINE_COLORS: Record<string, string> = {
  physics: "text-physics bg-physics/10 border-physics/30",
  chemistry: "text-chemistry bg-chemistry/10 border-chemistry/30",
  biology: "text-biology bg-biology/10 border-biology/30",
  mixed: "text-primary bg-primary/10 border-primary/30",
};

const LAB_LABELS: Record<string, string> = {
  "physics-pendulum": "Simple Pendulum",
  "physics-ohms-law": "Ohm's Law",
  "physics-projectile": "Projectile Motion",
  "physics-waves": "Wave Properties",
  "chemistry-titration": "Acid-Base Titration",
  "chemistry-gas-laws": "Ideal Gas Laws",
  "chemistry-electrolysis": "Electrolysis",
  "biology-punnett": "Punnett Square",
  "biology-photosynthesis": "Photosynthesis",
  "biology-osmosis": "Osmosis",
  "biology-enzymes": "Enzyme Kinetics",
};

export function ProgressDashboard() {
  const [labRuns, setLabRuns] = useState<LabRun[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [tab, setTab] = useState<"labs" | "exams">("labs");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      if (data.session) fetchData();
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(!!s);
      if (s) fetchData();
      else { setLabRuns([]); setExamAttempts([]); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: runs }, { data: exams }] = await Promise.all([
      supabase.from("lab_runs").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("exam_attempts").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setLabRuns(runs ?? []);
    setExamAttempts(exams ?? []);
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-4xl">📊</div>
        <h2 className="font-display text-xl font-semibold">Track your progress</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Sign in to see your lab history, exam scores, and subject breakdown.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const completedLabs = new Set(labRuns.filter((r) => r.completed).map((r) => r.lab_slug));
  const avgExamScore = examAttempts.length > 0
    ? Math.round(examAttempts.reduce((s, e) => s + (e.score / e.total) * 100, 0) / examAttempts.length)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <span className="chip uppercase">My progress</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Labs tried", value: new Set(labRuns.map((r) => r.lab_slug)).size },
          { label: "Labs completed", value: completedLabs.size },
          { label: "Quizzes taken", value: examAttempts.length },
          { label: "Avg quiz score", value: examAttempts.length > 0 ? `${avgExamScore}%` : "–" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Subject breakdown */}
      <div className="mb-8 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 font-display text-sm font-semibold">Subject breakdown</p>
        {["physics", "chemistry", "biology"].map((d) => {
          const count = labRuns.filter((r) => r.discipline === d && r.completed).length;
          const total = Object.keys(LAB_LABELS).filter((k) => k.startsWith(d)).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={d} className="mb-3">
              <div className="mb-1 flex justify-between text-xs">
                <span className="capitalize font-medium">{d}</span>
                <span className="text-muted-foreground">{count}/{total} labs</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all ${d === "physics" ? "bg-physics" : d === "chemistry" ? "bg-chemistry" : "bg-biology"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {(["labs", "exams"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}
          >
            {t === "labs" ? "Lab history" : "Exam results"}
          </button>
        ))}
      </div>

      {tab === "labs" && (
        <div className="space-y-2">
          {labRuns.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No lab runs yet. Open a lab and save your progress!
            </p>
          ) : (
            labRuns.map((run) => (
              <div key={run.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <div className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${DISCIPLINE_COLORS[run.discipline] ?? ""}`}>
                  {run.discipline}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{LAB_LABELS[run.lab_slug] ?? run.lab_slug}</p>
                  <p className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleString()}</p>
                </div>
                {run.score != null && (
                  <span className="font-mono text-sm font-semibold">{run.score.toFixed ? run.score.toFixed(1) : run.score}</span>
                )}
                <span className={`text-xs font-medium ${run.completed ? "text-green-600" : "text-muted-foreground"}`}>
                  {run.completed ? "Done" : "In progress"}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "exams" && (
        <div className="space-y-2">
          {examAttempts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No exam attempts yet. Try the Exam Prep section!
            </p>
          ) : (
            examAttempts.map((attempt) => {
              const pct = Math.round((attempt.score / attempt.total) * 100);
              const grade = pct >= 80 ? "A*" : pct >= 70 ? "A" : pct >= 60 ? "B" : pct >= 50 ? "C" : pct >= 40 ? "D" : "U";
              const gc = pct >= 70 ? "text-green-700 bg-green-100" : pct >= 50 ? "text-yellow-700 bg-yellow-100" : "text-red-700 bg-red-100";
              return (
                <div key={attempt.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <div className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${DISCIPLINE_COLORS[attempt.discipline] ?? ""}`}>
                    {attempt.discipline}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{attempt.topic}</p>
                    <p className="text-xs text-muted-foreground">{new Date(attempt.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{attempt.score}/{attempt.total}</p>
                    <p className="text-xs text-muted-foreground">{pct}%</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${gc}`}>{grade}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
