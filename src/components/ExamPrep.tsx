import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Discipline = "physics" | "chemistry" | "biology" | "mixed";

interface Question {
  id: string;
  discipline: Discipline;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  marks: number;
}

const QUESTIONS: Question[] = [
  // PHYSICS
  {
    id: "p1", discipline: "physics", topic: "Mechanics", marks: 1,
    question: "A car accelerates from rest at 2 m/s² for 5 seconds. What is its final velocity?",
    options: ["5 m/s", "10 m/s", "15 m/s", "20 m/s"],
    answer: 1,
    explanation: "v = u + at = 0 + 2×5 = 10 m/s",
  },
  {
    id: "p2", discipline: "physics", topic: "Forces", marks: 1,
    question: "A force of 20 N acts on a mass of 4 kg. What is the acceleration?",
    options: ["2 m/s²", "5 m/s²", "80 m/s²", "0.2 m/s²"],
    answer: 1,
    explanation: "F = ma → a = F/m = 20/4 = 5 m/s²",
  },
  {
    id: "p3", discipline: "physics", topic: "Electricity", marks: 1,
    question: "A 12 V battery drives a current of 3 A through a resistor. What is the resistance?",
    options: ["36 Ω", "4 Ω", "0.25 Ω", "9 Ω"],
    answer: 1,
    explanation: "R = V/I = 12/3 = 4 Ω (Ohm's Law)",
  },
  {
    id: "p4", discipline: "physics", topic: "Waves", marks: 1,
    question: "A wave has frequency 500 Hz and wavelength 0.68 m. What is its speed?",
    options: ["340 m/s", "500 m/s", "0.68 m/s", "735 m/s"],
    answer: 0,
    explanation: "v = fλ = 500 × 0.68 = 340 m/s",
  },
  {
    id: "p5", discipline: "physics", topic: "Energy", marks: 1,
    question: "A 2 kg ball is at 10 m height. What is its gravitational PE? (g = 10 m/s²)",
    options: ["20 J", "100 J", "200 J", "1000 J"],
    answer: 2,
    explanation: "PE = mgh = 2 × 10 × 10 = 200 J",
  },
  {
    id: "p6", discipline: "physics", topic: "Pressure", marks: 1,
    question: "Pressure = 500 Pa acts over area 0.25 m². What is the force?",
    options: ["2000 N", "125 N", "0.0005 N", "1250 N"],
    answer: 1,
    explanation: "F = P × A = 500 × 0.25 = 125 N",
  },
  {
    id: "p7", discipline: "physics", topic: "Thermal", marks: 1,
    question: "Which process transfers heat through a vacuum?",
    options: ["Conduction", "Convection", "Radiation", "Evaporation"],
    answer: 2,
    explanation: "Only radiation (electromagnetic waves) can travel through a vacuum.",
  },
  {
    id: "p8", discipline: "physics", topic: "Magnetism", marks: 1,
    question: "A wire carries current northward in a field pointing east. In which direction is the force?",
    options: ["North", "South", "Downward", "Upward"],
    answer: 3,
    explanation: "Using Fleming's left-hand rule: thumb = force = upward.",
  },
  {
    id: "p9", discipline: "physics", topic: "Optics", marks: 1,
    question: "Light travels from glass (n=1.5) to air (n=1). At the critical angle, the refracted ray travels at:",
    options: ["0°", "45°", "90°", "180°"],
    answer: 2,
    explanation: "At the critical angle, the refracted ray grazes the surface at 90° to the normal.",
  },
  {
    id: "p10", discipline: "physics", topic: "Nuclear", marks: 1,
    question: "A radioactive nucleus emits an alpha particle. Its mass number decreases by:",
    options: ["1", "2", "4", "0"],
    answer: 2,
    explanation: "An alpha particle is ⁴He, so mass number decreases by 4.",
  },
  // CHEMISTRY
  {
    id: "c1", discipline: "chemistry", topic: "Atomic Structure", marks: 1,
    question: "An atom has 17 protons and 18 neutrons. What is its mass number?",
    options: ["17", "18", "35", "1"],
    answer: 2,
    explanation: "Mass number = protons + neutrons = 17 + 18 = 35",
  },
  {
    id: "c2", discipline: "chemistry", topic: "Bonding", marks: 1,
    question: "Which type of bonding involves the sharing of electrons?",
    options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
    answer: 1,
    explanation: "Covalent bonding involves sharing of electron pairs between non-metal atoms.",
  },
  {
    id: "c3", discipline: "chemistry", topic: "Acids and Bases", marks: 1,
    question: "What is the pH of a solution with [H⁺] = 1×10⁻³ mol/L?",
    options: ["11", "3", "7", "−3"],
    answer: 1,
    explanation: "pH = −log[H⁺] = −log(10⁻³) = 3",
  },
  {
    id: "c4", discipline: "chemistry", topic: "Electrolysis", marks: 1,
    question: "During electrolysis of copper sulfate, what forms at the cathode?",
    options: ["Oxygen gas", "Hydrogen gas", "Copper metal", "Sulfur"],
    answer: 2,
    explanation: "Cu²⁺ ions gain electrons at the cathode: Cu²⁺ + 2e⁻ → Cu",
  },
  {
    id: "c5", discipline: "chemistry", topic: "Rates of Reaction", marks: 1,
    question: "Which factor does NOT affect the rate of a chemical reaction?",
    options: ["Temperature", "Catalyst", "Colour of reactants", "Concentration"],
    answer: 2,
    explanation: "Colour is a physical property and does not affect reaction rate.",
  },
  {
    id: "c6", discipline: "chemistry", topic: "Equilibrium", marks: 1,
    question: "For N₂ + 3H₂ ⇌ 2NH₃, increasing pressure favours:",
    options: ["Forward reaction", "Backward reaction", "No change", "Both equally"],
    answer: 0,
    explanation: "Forward reaction has fewer moles of gas (2 vs 4), so increased pressure favours it.",
  },
  {
    id: "c7", discipline: "chemistry", topic: "Organic", marks: 1,
    question: "Which is the general formula for alkanes?",
    options: ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"],
    answer: 1,
    explanation: "Alkanes are saturated hydrocarbons: CₙH₂ₙ₊₂",
  },
  {
    id: "c8", discipline: "chemistry", topic: "Moles", marks: 1,
    question: "How many moles are in 44 g of CO₂? (M = 44 g/mol)",
    options: ["44", "0.5", "2", "1"],
    answer: 3,
    explanation: "n = m/M = 44/44 = 1 mol",
  },
  {
    id: "c9", discipline: "chemistry", topic: "Redox", marks: 1,
    question: "In the reaction Zn + CuSO₄ → ZnSO₄ + Cu, which species is oxidised?",
    options: ["Cu²⁺", "Zn", "SO₄²⁻", "Zn²⁺"],
    answer: 1,
    explanation: "Zn loses electrons (0 → +2), so it is oxidised.",
  },
  {
    id: "c10", discipline: "chemistry", topic: "Gas Laws", marks: 1,
    question: "At constant temperature, if pressure doubles, volume:",
    options: ["Doubles", "Stays the same", "Halves", "Quadruples"],
    answer: 2,
    explanation: "Boyle's Law: P₁V₁ = P₂V₂. If P doubles, V halves.",
  },
  // BIOLOGY
  {
    id: "b1", discipline: "biology", topic: "Cell Biology", marks: 1,
    question: "Which organelle is responsible for aerobic respiration in eukaryotic cells?",
    options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"],
    answer: 2,
    explanation: "Mitochondria carry out aerobic respiration, producing ATP.",
  },
  {
    id: "b2", discipline: "biology", topic: "Genetics", marks: 1,
    question: "In a monohybrid cross Aa × Aa, what fraction of offspring will be homozygous dominant (AA)?",
    options: ["1/4", "1/2", "3/4", "0"],
    answer: 0,
    explanation: "Punnett: AA:Aa:aa = 1:2:1. AA = 1/4",
  },
  {
    id: "b3", discipline: "biology", topic: "Photosynthesis", marks: 1,
    question: "Which gas is produced as a by-product of photosynthesis?",
    options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
    answer: 2,
    explanation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Oxygen is released.",
  },
  {
    id: "b4", discipline: "biology", topic: "Transport", marks: 1,
    question: "A cell placed in pure water will:",
    options: ["Shrink (crenate)", "Stay the same", "Swell (turgid)", "Burst immediately"],
    answer: 2,
    explanation: "Pure water is hypotonic to the cell; water enters by osmosis, cell swells.",
  },
  {
    id: "b5", discipline: "biology", topic: "Enzymes", marks: 1,
    question: "What happens to enzyme activity above the optimum temperature?",
    options: ["It increases", "It stays constant", "It decreases due to denaturation", "It becomes inhibited"],
    answer: 2,
    explanation: "High temperatures denature the enzyme, changing its active site shape.",
  },
  {
    id: "b6", discipline: "biology", topic: "Respiration", marks: 1,
    question: "What is the net ATP yield of anaerobic respiration in yeast per glucose molecule?",
    options: ["2", "32", "38", "0"],
    answer: 0,
    explanation: "Anaerobic: glycolysis only → net 2 ATP. Aerobic gives ~32 ATP.",
  },
  {
    id: "b7", discipline: "biology", topic: "Evolution", marks: 1,
    question: "Which scientist proposed natural selection as the mechanism for evolution?",
    options: ["Mendel", "Lamarck", "Darwin", "Watson"],
    answer: 2,
    explanation: "Charles Darwin proposed natural selection in 'On the Origin of Species' (1859).",
  },
  {
    id: "b8", discipline: "biology", topic: "Ecology", marks: 1,
    question: "In a food web, which organisms occupy the lowest trophic level?",
    options: ["Carnivores", "Herbivores", "Producers", "Decomposers"],
    answer: 2,
    explanation: "Producers (plants) are at the base of all food chains.",
  },
  {
    id: "b9", discipline: "biology", topic: "DNA", marks: 1,
    question: "Which base pairs with Adenine in DNA?",
    options: ["Guanine", "Cytosine", "Thymine", "Uracil"],
    answer: 2,
    explanation: "In DNA: A pairs with T; G pairs with C.",
  },
  {
    id: "b10", discipline: "biology", topic: "Hormones", marks: 1,
    question: "Which hormone is released in response to high blood glucose?",
    options: ["Glucagon", "Adrenaline", "Insulin", "Thyroxine"],
    answer: 2,
    explanation: "Insulin (from beta cells of pancreas) lowers blood glucose.",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function ExamPrep() {
  const [discipline, setDiscipline] = useState<Discipline>("mixed");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [phase, setPhase] = useState<"config" | "quiz" | "review">("config");
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [count, setCount] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const startQuiz = () => {
    const pool = shuffle(
      discipline === "mixed"
        ? QUESTIONS
        : QUESTIONS.filter((q) => q.discipline === discipline)
    ).slice(0, count);
    setQuestions(pool);
    setAnswers(new Array(pool.length).fill(null));
    setCurrent(0);
    setSelected(null);
    setTimeLeft(count * 90); // 90s per question
    setTimerActive(true);
    setPhase("quiz");
  };

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          setPhase("review");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const submitAnswer = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      clearInterval(timerRef.current!);
      setTimerActive(false);
      setPhase("review");
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const saveResult = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("exam_attempts").insert({
        topic: discipline,
        discipline,
        score,
        total: questions.length,
        answers: answers.map((a, i) => ({ q: questions[i]?.id, answered: a, correct: questions[i]?.answer })),
      });
      if (error) throw error;
    } finally {
      setSaving(false);
    }
  };

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  const gradeColor = pct >= 70 ? "text-green-700" : pct >= 50 ? "text-yellow-700" : "text-red-700";
  const gradeBg = pct >= 70 ? "bg-green-50 border-green-200" : pct >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  const grade = pct >= 80 ? "A*" : pct >= 70 ? "A" : pct >= 60 ? "B" : pct >= 50 ? "C" : pct >= 40 ? "D" : "U";

  if (phase === "config") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <span className="chip uppercase">Exam Prep</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">IGCSE Practice Quiz</h1>
          <p className="mt-2 text-muted-foreground">Test your understanding with exam-style multiple choice questions.</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Subject</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["mixed", "physics", "chemistry", "biology"] as Discipline[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscipline(d)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-all ${discipline === d ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-card hover:bg-secondary"}`}
                >
                  {d === "mixed" ? "All subjects" : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Number of questions</p>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${count === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">~{Math.round(count * 1.5)} minutes</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Quiz summary</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>{count} questions · {count * 90}s timer · {count} marks</li>
              <li>IGCSE-style multiple choice with explanations</li>
              <li>Review all answers at the end</li>
            </ul>
          </div>

          <button
            onClick={startQuiz}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Start quiz
          </button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className={`chip uppercase ${q.discipline}`}>{q.discipline}</span>
            <p className="mt-1 text-xs text-muted-foreground">{q.topic}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? "text-red-600" : "text-foreground"}`}>
              {mm}:{ss}
            </div>
            <div className="text-sm text-muted-foreground">{current + 1}/{questions.length}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-base font-medium leading-relaxed">{q.question}</p>
          <p className="mt-1 text-xs text-muted-foreground">[{q.marks} mark{q.marks > 1 ? "s" : ""}]</p>

          <div className="mt-4 space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${selected === i ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border bg-background hover:bg-secondary"}`}
              >
                <span className="mr-2 font-mono">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-3">
          <button
            onClick={() => {
              if (current > 0) { setCurrent(current - 1); setSelected(answers[current - 1]); }
            }}
            disabled={current === 0}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm disabled:opacity-40 hover:bg-secondary"
          >
            Back
          </button>
          <button
            onClick={submitAnswer}
            disabled={selected === null}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow disabled:opacity-40 hover:bg-primary/90"
          >
            {current + 1 === questions.length ? "Finish" : "Next question"}
          </button>
        </div>
      </div>
    );
  }

  // Review phase
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <span className="chip uppercase">Results</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Quiz complete</h1>
      </div>

      {/* Score card */}
      <div className={`mb-8 rounded-xl border p-6 ${gradeBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-mono text-5xl font-bold ${gradeColor}`}>{pct}%</p>
            <p className="mt-1 text-sm text-muted-foreground">{score} / {questions.length} correct</p>
          </div>
          <div className={`grid h-16 w-16 place-items-center rounded-full border-4 ${gradeBg} text-2xl font-bold ${gradeColor}`}>
            {grade}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/60">
          <div className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Answer review */}
      <div className="space-y-4">
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const correct = userAnswer === q.answer;
          return (
            <div key={q.id} className={`rounded-xl border p-4 ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${correct ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                  {correct ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your answer: <span className={correct ? "text-green-700" : "text-red-700"}>{userAnswer !== null ? q.options[userAnswer] : "No answer"}</span>
                    {!correct && <> · Correct: <span className="text-green-700">{q.options[q.answer]}</span></>}
                  </p>
                  <p className="mt-2 rounded-md bg-white/80 p-2 text-xs text-muted-foreground">{q.explanation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => setPhase("config")} className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-secondary">
          New quiz
        </button>
        {session && (
          <button
            onClick={saveResult}
            disabled={saving}
            className="rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save result"}
          </button>
        )}
      </div>
    </div>
  );
}
