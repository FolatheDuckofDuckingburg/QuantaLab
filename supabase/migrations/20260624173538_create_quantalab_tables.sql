
-- Lab runs: records every time a student saves progress in a lab
CREATE TABLE IF NOT EXISTS lab_runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_slug    text NOT NULL,
  discipline  text NOT NULL CHECK (discipline IN ('physics','chemistry','biology')),
  score       numeric,
  completed   boolean DEFAULT false,
  payload     jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE lab_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_lab_runs" ON lab_runs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_lab_runs" ON lab_runs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_lab_runs" ON lab_runs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_lab_runs" ON lab_runs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Exam attempts: one row per quiz attempt
CREATE TABLE IF NOT EXISTS exam_attempts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic       text NOT NULL,
  discipline  text NOT NULL CHECK (discipline IN ('physics','chemistry','biology','mixed')),
  score       integer NOT NULL,
  total       integer NOT NULL,
  answers     jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_exam_attempts" ON exam_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_exam_attempts" ON exam_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_exam_attempts" ON exam_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_exam_attempts" ON exam_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
