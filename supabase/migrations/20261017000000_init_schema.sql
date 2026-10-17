-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    preferred_exam TEXT CHECK (preferred_exam IN ('CSE', 'DA', 'BOTH')) DEFAULT 'BOTH',
    daily_budget_hours NUMERIC(3,1) DEFAULT 4.0,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    exam TEXT NOT NULL CHECK (exam IN ('CSE', 'DA', 'BOTH')),
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    name TEXT NOT NULL,
    exam TEXT NOT NULL CHECK (exam IN ('CSE', 'DA', 'BOTH')),
    first_studied_at DATE NOT NULL,
    topic_type TEXT NOT NULL CHECK (topic_type IN ('Theory', 'Numerical', 'Programming', 'Mixed')),
    learning_source TEXT NOT NULL CHECK (learning_source IN ('Lecture', 'Book', 'Notes', 'Other')),
    initial_confidence TEXT NOT NULL CHECK (initial_confidence IN ('Low', 'Medium', 'High')),
    estimated_difficulty TEXT NOT NULL CHECK (estimated_difficulty IN ('Easy', 'Medium', 'Hard')),
    mastery_status TEXT NOT NULL CHECK (mastery_status IN ('Learning', 'Revising', 'Mastered')) DEFAULT 'Learning',
    notes TEXT DEFAULT '',
    resource_url TEXT DEFAULT '',
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVISION SESSIONS
CREATE TABLE IF NOT EXISTS public.revision_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'RESCHEDULED')) DEFAULT 'PENDING',
    duration_minutes INT DEFAULT 30,
    recall_rating INT CHECK (recall_rating BETWEEN 1 AND 4),
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    mistakes_summary TEXT DEFAULT '',
    retrieval_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRACTICE LOGS (PYQ Tracker)
CREATE TABLE IF NOT EXISTS public.practice_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    exam TEXT NOT NULL CHECK (exam IN ('CSE', 'DA')),
    gate_year INT NOT NULL,
    question_ref TEXT NOT NULL,
    marks NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    result TEXT NOT NULL CHECK (result IN ('CORRECT', 'INCORRECT', 'SKIPPED', 'PARTIAL')),
    time_taken_seconds INT DEFAULT 180,
    error_category TEXT CHECK (error_category IN ('Conceptual', 'Calculation', 'Misread Question', 'Formula Recall', 'Time Management', 'None')),
    explanation TEXT DEFAULT '',
    solved_independently BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDY ACTIVITIES (Heatmap & Streaks)
CREATE TABLE IF NOT EXISTS public.study_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('REVISION', 'PYQ', 'NEW_TOPIC', 'MOCK')),
    duration_minutes INT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_topics_user ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS idx_rev_sessions_due ON public.revision_sessions(user_id, scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_rev_sessions_topic ON public.revision_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_practice_user_date ON public.practice_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.study_activities(user_id, activity_date);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their subjects" ON public.subjects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their topics" ON public.topics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their revisions" ON public.revision_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their practice logs" ON public.practice_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their study activities" ON public.study_activities
    FOR ALL USING (auth.uid() = user_id);
