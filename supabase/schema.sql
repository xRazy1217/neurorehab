-- ============================================================
-- NeuroRehab — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'patient')),
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Patients (clinical data)
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES profiles(id),
  diagnosis text,
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Exercise library
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('image_naming', 'phrase_repetition', 'visual_memory')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}',
  duration_minutes int NOT NULL DEFAULT 5,
  area text NOT NULL CHECK (area IN ('lenguaje', 'habla', 'cognicion')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Assigned tasks
CREATE TABLE IF NOT EXISTS patient_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  due_date date,
  completed boolean DEFAULT false,
  completed_at timestamptz
);

-- Patient responses
CREATE TABLE IF NOT EXISTS task_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_task_id uuid NOT NULL REFERENCES patient_tasks(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recording_url text,
  selected_options jsonb,
  score int CHECK (score >= 0 AND score <= 100),
  therapist_note text,
  responded_at timestamptz DEFAULT now()
);

-- Daily progress
CREATE TABLE IF NOT EXISTS progress_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date date NOT NULL,
  area text NOT NULL CHECK (area IN ('lenguaje', 'habla', 'cognicion')),
  percentage int NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  tasks_completed int NOT NULL DEFAULT 0,
  time_spent_minutes int NOT NULL DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_daily ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- patients
CREATE POLICY "Admins manage all patients" ON patients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Patients read own record" ON patients
  FOR SELECT USING (auth.uid() = id);

-- tasks
CREATE POLICY "Admins manage tasks" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Patients read assigned tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_tasks pt
      WHERE pt.task_id = id AND pt.patient_id = auth.uid()
    )
  );

-- patient_tasks
CREATE POLICY "Admins manage patient_tasks" ON patient_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Patients read and update own tasks" ON patient_tasks
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients update own tasks" ON patient_tasks
  FOR UPDATE USING (patient_id = auth.uid());

-- task_responses
CREATE POLICY "Patients insert own responses" ON task_responses
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients read own responses" ON task_responses
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Admins read all responses" ON task_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins update responses (therapist note)" ON task_responses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- progress_daily
CREATE POLICY "Patients manage own progress" ON progress_daily
  FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Admins read all progress" ON progress_daily
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these manually or via Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('task-images', 'task-images', true);

-- ============================================================
-- SEED DATA (sample tasks)
-- ============================================================

-- Note: Replace 'your-admin-uuid' with actual admin UUID
-- INSERT INTO tasks (type, title, description, content, duration_minutes, area, created_by) VALUES
-- ('image_naming', 'Nombrar objetos del hogar', 'Identifica objetos comunes del hogar', 
--   '{"images":[{"url":"https://picsum.photos/400/400?random=10","answer":"silla"},{"url":"https://picsum.photos/400/400?random=11","answer":"mesa"}]}',
--   5, 'lenguaje', 'your-admin-uuid'),
-- ('phrase_repetition', 'Frases cotidianas', 'Repite frases de uso diario',
--   '{"phrases":["El perro corre por el parque","Hoy es un día soleado","Me gustaría tomar un café"]}',
--   8, 'habla', 'your-admin-uuid'),
-- ('visual_memory', 'Memoria de objetos', 'Memoriza los objetos de la imagen',
--   '{"image_url":"https://picsum.photos/400/400?random=20","display_seconds":5,"question":"¿Qué objetos recuerdas?","options":["Taza","Silla","Lámpara","Libro","Planta","Teléfono"],"correct":["Taza","Silla","Lámpara"]}',
--   6, 'cognicion', 'your-admin-uuid');
