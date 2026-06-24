import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! You can now sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Save your lab progress and exam scores."
              : "Free account to track your progress."}
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-6 flex rounded-lg border border-border bg-secondary p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${mode === m ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@school.edu"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none ring-primary/30 transition-shadow focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none ring-primary/30 transition-shadow focus:ring-2"
            />
            {mode === "signup" && (
              <p className="mt-1 text-[11px] text-muted-foreground">Minimum 6 characters</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "No account? " : "Have an account? "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }} className="text-primary underline-offset-2 hover:underline">
            {mode === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
