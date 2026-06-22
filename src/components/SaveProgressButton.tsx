import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { recordLabRun } from "@/lib/progress.functions";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function SaveProgressButton({
  lab_slug,
  discipline,
  score,
  payload,
  completed,
  label = "Save progress",
}: {
  lab_slug: string;
  discipline: "physics" | "chemistry" | "biology";
  score?: number;
  payload?: Record<string, unknown>;
  completed?: boolean;
  label?: string;
}) {
  const fn = useServerFn(recordLabRun);
  const [signedIn, setSignedIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => { mounted.current = false; sub.subscription.unsubscribe(); };
  }, []);

  return (
    <button
      disabled={saving}
      onClick={async () => {
        if (!signedIn) { toast.message("Sign in to save your progress"); return; }
        setSaving(true);
        try {
          await fn({ data: { lab_slug, discipline, score, payload, completed } });
          toast.success("Progress saved");
        } catch (e) {
          toast.error("Could not save", { description: (e as Error).message });
        } finally {
          if (mounted.current) setSaving(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
    >
      <Save className="h-3.5 w-3.5" />
      {saving ? "Saving…" : signedIn ? label : "Sign in to save"}
    </button>
  );
}
