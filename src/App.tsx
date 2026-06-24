import { useEffect, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/auth/AuthModal";
import { HubPage } from "@/pages/HubPage";
import { PhysicsPage } from "@/components/pages/PhysicsPage";
import { ChemistryPage } from "@/components/pages/ChemistryPage";
import { BiologyPage } from "@/components/pages/BiologyPage";
import { ExamPrep } from "@/components/ExamPrep";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { FlaskConical } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Hub", end: true },
  { to: "/physics", label: "Physics" },
  { to: "/chemistry", label: "Chemistry" },
  { to: "/biology", label: "Biology" },
  { to: "/exam-prep", label: "Exam Prep" },
];

function Nav({ onSignIn }: { onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "border-b border-border bg-background/95 shadow-sm backdrop-blur"
          : "bg-background/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 font-display text-base font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FlaskConical className="h-4 w-4" />
          </span>
          <span>
            Quanta<span className="text-primary">Lab</span>
          </span>
        </NavLink>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <NavLink
                to="/progress"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                  }`
                }
              >
                My progress
              </NavLink>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex gap-1 overflow-x-auto border-t border-border/50 px-4 py-1.5 md:hidden scrollbar-none">
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `shrink-0 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Nav onSignIn={() => setAuthOpen(true)} />

      <main className="animate-page" key={location.pathname}>
        <Routes>
          <Route path="/" element={<HubPage onSignIn={() => setAuthOpen(true)} />} />
          <Route path="/physics" element={<PhysicsPage />} />
          <Route path="/chemistry" element={<ChemistryPage />} />
          <Route path="/biology" element={<BiologyPage />} />
          <Route path="/exam-prep" element={<ExamPrep />} />
          <Route path="/progress" element={<ProgressDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="font-display text-5xl font-bold text-muted-foreground/30">404</p>
      <p className="mt-4 text-muted-foreground">Page not found.</p>
      <NavLink to="/" className="mt-4 text-sm text-primary underline-offset-2 hover:underline">
        Back to Hub
      </NavLink>
    </div>
  );
}
