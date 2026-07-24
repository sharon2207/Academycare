-- ============================================================
-- AcademiCare -- PostgreSQL Database Schema
-- Cloud Analytics Platform for Student Burnout Detection
-- ============================================================
-- Database  : academiccare_db
-- Host      : AWS RDS (PostgreSQL 15)
-- Charset   : UTF-8
-- SDG 3: Good Health | SDG 4: Quality Education
--
-- Tables (11):
--   1. users
--   2. student_profiles
--   3. daily_checkins
--   4. burnout_scores
--   5. exam_timetable
--   6. attendance_records
--   7. internal_marks
--   8. wellness_recommendations
--   9. counselor_alerts
--  10. peer_groups
--  11. resilience_scores
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Drop existing tables (clean re-run) ──────────────────────
DROP TABLE IF EXISTS resilience_scores       CASCADE;
DROP TABLE IF EXISTS peer_groups             CASCADE;
DROP TABLE IF EXISTS counselor_alerts        CASCADE;
DROP TABLE IF EXISTS wellness_recommendations CASCADE;
DROP TABLE IF EXISTS burnout_scores          CASCADE;
DROP TABLE IF EXISTS daily_checkins          CASCADE;
DROP TABLE IF EXISTS internal_marks          CASCADE;
DROP TABLE IF EXISTS attendance_records      CASCADE;
DROP TABLE IF EXISTS exam_timetable          CASCADE;
DROP TABLE IF EXISTS student_profiles        CASCADE;
DROP TABLE IF EXISTS users                   CASCADE;

-- ── Custom ENUM types ─────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('student', 'counselor', 'faculty', 'admin');
CREATE TYPE risk_level     AS ENUM ('Low', 'Moderate', 'High', 'Critical');
CREATE TYPE alert_status   AS ENUM ('pending', 'acknowledged', 'resolved');
CREATE TYPE rec_category   AS ENUM ('sleep', 'study', 'mental', 'physical', 'social', 'nutrition');
CREATE TYPE exam_type      AS ENUM ('internal', 'midterm', 'university', 'practical', 'viva');

-- ============================================================
-- TABLE 1: users
-- Central authentication table (role-based access)
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    role            user_role    NOT NULL DEFAULT 'student',
    college_id      VARCHAR(50),            -- college-issued ID
    department      VARCHAR(100),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_dept     ON users(department);

COMMENT ON TABLE  users           IS 'Central auth table — all roles share this table';
COMMENT ON COLUMN users.role      IS 'student | counselor | faculty | admin';
COMMENT ON COLUMN users.college_id IS 'ERP-issued college roll number / employee ID';

-- ============================================================
-- TABLE 2: student_profiles
-- Extended profile for student-role users
-- ============================================================
CREATE TABLE student_profiles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number             VARCHAR(30) UNIQUE,
    year_of_study           SMALLINT CHECK (year_of_study BETWEEN 1 AND 6),
    section                 VARCHAR(10),
    -- Indian context stress flags
    placement_anxiety_flag  BOOLEAN  NOT NULL DEFAULT FALSE,
    gate_cat_prep_flag      BOOLEAN  NOT NULL DEFAULT FALSE,
    family_stress_flag      BOOLEAN  NOT NULL DEFAULT FALSE,
    physical_activity_hrs   NUMERIC(4,2) DEFAULT 0,   -- avg hours/day
    screen_time_hrs         NUMERIC(4,2) DEFAULT 0,
    -- Check-in streak
    checkin_streak_days     INTEGER NOT NULL DEFAULT 0,
    total_checkins          INTEGER NOT NULL DEFAULT 0,
    -- Consent for anonymous sharing with counselor
    counselor_alert_consent BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_sp_user_id ON student_profiles(user_id);
CREATE INDEX idx_sp_roll    ON student_profiles(roll_number);

COMMENT ON TABLE  student_profiles IS 'Extended student profile — academic & wellness context';
COMMENT ON COLUMN student_profiles.gate_cat_prep_flag IS 'True if student is preparing for GATE/CAT';
COMMENT ON COLUMN student_profiles.counselor_alert_consent IS 'FERPA-style: student consents to anonymous alerts';

-- ============================================================
-- TABLE 3: daily_checkins
-- Core wellness data — logged every day by student
-- ============================================================
CREATE TABLE daily_checkins (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date    DATE    NOT NULL DEFAULT CURRENT_DATE,
    -- Core check-in fields
    mood_score      NUMERIC(4,1) NOT NULL CHECK (mood_score  BETWEEN 1 AND 10),
    sleep_hours     NUMERIC(4,1) NOT NULL CHECK (sleep_hours BETWEEN 0 AND 14),
    study_hours     NUMERIC(4,1) NOT NULL CHECK (study_hours BETWEEN 0 AND 20),
    physical_activity_hrs NUMERIC(4,1) DEFAULT 0 CHECK (physical_activity_hrs >= 0),
    -- Indian context stress flags (Step 3 of check-in form)
    placement_anxiety   BOOLEAN NOT NULL DEFAULT FALSE,
    gate_cat_prep       BOOLEAN NOT NULL DEFAULT FALSE,
    family_stress       BOOLEAN NOT NULL DEFAULT FALSE,
    social_isolation    BOOLEAN NOT NULL DEFAULT FALSE,
    -- Optional free-text note
    stress_notes    TEXT,
    -- Submission metadata
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- One check-in per student per day
    UNIQUE(student_id, checkin_date)
);

CREATE INDEX idx_checkin_student   ON daily_checkins(student_id);
CREATE INDEX idx_checkin_date      ON daily_checkins(checkin_date);
CREATE INDEX idx_checkin_student_date ON daily_checkins(student_id, checkin_date DESC);

COMMENT ON TABLE  daily_checkins  IS '2-minute daily PWA check-in data — core ML input source';
COMMENT ON COLUMN daily_checkins.mood_score    IS '1=Terrible to 10=Amazing — student self-reported';
COMMENT ON COLUMN daily_checkins.sleep_hours   IS 'Hours slept last night';
COMMENT ON COLUMN daily_checkins.study_hours   IS 'Hours studied today (plan/actual)';

-- ============================================================
-- TABLE 4: burnout_scores
-- ML model output — one score per student per day
-- ============================================================
CREATE TABLE burnout_scores (
    id                  UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_id          UUID      REFERENCES daily_checkins(id),
    score_date          DATE      NOT NULL DEFAULT CURRENT_DATE,
    -- Random Forest Classifier output
    burnout_score       NUMERIC(5,2) NOT NULL CHECK (burnout_score BETWEEN 0 AND 100),
    risk_level          risk_level   NOT NULL,
    rf_confidence       NUMERIC(4,3) CHECK (rf_confidence BETWEEN 0 AND 1),
    -- Class probabilities from RF
    prob_low            NUMERIC(4,3),
    prob_moderate       NUMERIC(4,3),
    prob_high           NUMERIC(4,3),
    prob_critical       NUMERIC(4,3),
    -- Score delta from previous day
    score_delta         NUMERIC(5,2),  -- positive = worsening, negative = improving
    -- LSTM 7-day forecast (stored as JSON array)
    lstm_forecast_7d    JSONB,         -- [68.1, 71.2, 74.5, 77.0, 79.3, 81.1, 83.4]
    -- Exam-day stress prediction (Regression model)
    exam_stress_pred    NUMERIC(5,2),
    -- Computed at
    computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    model_version       VARCHAR(20) DEFAULT 'rf-v1.0',
    UNIQUE(student_id, score_date)
);

CREATE INDEX idx_bs_student        ON burnout_scores(student_id);
CREATE INDEX idx_bs_date           ON burnout_scores(score_date);
CREATE INDEX idx_bs_risk           ON burnout_scores(risk_level);
CREATE INDEX idx_bs_student_date   ON burnout_scores(student_id, score_date DESC);
CREATE INDEX idx_bs_critical       ON burnout_scores(risk_level) WHERE risk_level = 'Critical';

COMMENT ON TABLE  burnout_scores IS 'Random Forest + LSTM model outputs — one record per student per day';
COMMENT ON COLUMN burnout_scores.lstm_forecast_7d IS 'JSON array of 7 predicted daily burnout scores from LSTM';
COMMENT ON COLUMN burnout_scores.score_delta IS 'Change from previous day: positive=worsening, negative=improving';

-- ============================================================
-- TABLE 5: exam_timetable
-- Uploaded once per semester by admin/faculty
-- ============================================================
CREATE TABLE exam_timetable (
    id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    department      VARCHAR(100) NOT NULL,
    subject_name    VARCHAR(150) NOT NULL,
    subject_code    VARCHAR(30),
    exam_date       DATE      NOT NULL,
    exam_time       TIME,
    exam_type       exam_type NOT NULL DEFAULT 'university',
    duration_mins   SMALLINT  DEFAULT 180,
    -- Weight for regression model (0.0-1.0)
    -- internal=0.4, midterm=0.6, university=1.0
    stress_weight   NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (stress_weight BETWEEN 0 AND 1),
    hall_number     VARCHAR(30),
    uploaded_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_dept    ON exam_timetable(department);
CREATE INDEX idx_exam_date    ON exam_timetable(exam_date);
CREATE INDEX idx_exam_upcoming ON exam_timetable(exam_date) WHERE exam_date >= CURRENT_DATE;

COMMENT ON TABLE  exam_timetable IS 'Semester exam schedule — feeds Regression model for stress prediction';
COMMENT ON COLUMN exam_timetable.stress_weight IS '0.4=internal, 0.6=midterm, 1.0=university final';

-- ============================================================
-- TABLE 6: attendance_records
-- Daily attendance — synced from college ERP
-- ============================================================
CREATE TABLE attendance_records (
    id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_code    VARCHAR(30),
    subject_name    VARCHAR(150),
    class_date      DATE      NOT NULL,
    is_present      BOOLEAN   NOT NULL,
    -- ERP sync metadata
    synced_from_erp BOOLEAN   DEFAULT FALSE,
    synced_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, subject_code, class_date)
);

CREATE INDEX idx_att_student   ON attendance_records(student_id);
CREATE INDEX idx_att_subject   ON attendance_records(subject_code);
CREATE INDEX idx_att_date      ON attendance_records(class_date);

-- View: attendance percentage per student per subject
CREATE VIEW student_attendance_summary AS
SELECT
    student_id,
    subject_code,
    subject_name,
    COUNT(*) AS total_classes,
    SUM(CASE WHEN is_present THEN 1 ELSE 0 END) AS attended,
    ROUND(
        100.0 * SUM(CASE WHEN is_present THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) AS attendance_pct
FROM attendance_records
GROUP BY student_id, subject_code, subject_name;

COMMENT ON TABLE attendance_records IS 'Daily class attendance — synced from ERP or entered manually';
COMMENT ON VIEW  student_attendance_summary IS 'Auto-computed attendance % per student per subject';

-- ============================================================
-- TABLE 7: internal_marks
-- Internal/assignment marks — from college ERP or faculty upload
-- ============================================================
CREATE TABLE internal_marks (
    id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_code    VARCHAR(30),
    subject_name    VARCHAR(150),
    assessment_name VARCHAR(150),   -- "Unit Test 1", "Assignment 2", etc.
    marks_obtained  NUMERIC(6,2) NOT NULL,
    max_marks       NUMERIC(6,2) NOT NULL DEFAULT 100,
    marks_pct       NUMERIC(5,2) GENERATED ALWAYS AS
                    (ROUND(marks_obtained / max_marks * 100, 2)) STORED,
    -- Faculty who entered the marks
    entered_by      UUID REFERENCES users(id),
    exam_date       DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marks_student  ON internal_marks(student_id);
CREATE INDEX idx_marks_subject  ON internal_marks(subject_code);

-- View: average marks per student per subject
CREATE VIEW student_marks_summary AS
SELECT
    student_id,
    subject_code,
    subject_name,
    COUNT(*) AS assessments,
    ROUND(AVG(marks_pct), 2) AS avg_marks_pct,
    MIN(marks_pct) AS min_marks_pct,
    MAX(marks_pct) AS max_marks_pct
FROM internal_marks
GROUP BY student_id, subject_code, subject_name;

COMMENT ON TABLE internal_marks IS 'Internal assessment marks — key academic performance input for RF model';
COMMENT ON COLUMN internal_marks.marks_pct IS 'Auto-computed: (marks_obtained / max_marks) * 100';

-- ============================================================
-- TABLE 8: wellness_recommendations
-- AI-generated personalized recommendations
-- ============================================================
CREATE TABLE wellness_recommendations (
    id                  UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    burnout_score_id    UUID      REFERENCES burnout_scores(id),
    recommendation_date DATE      NOT NULL DEFAULT CURRENT_DATE,
    category            rec_category NOT NULL,
    priority            SMALLINT  NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
    -- 1=Critical, 2=High, 3=Moderate, 4=Low, 5=Informational
    title               VARCHAR(150) NOT NULL,
    body_text           TEXT      NOT NULL,
    -- Action tracking
    was_shown           BOOLEAN   DEFAULT FALSE,
    was_clicked         BOOLEAN   DEFAULT FALSE,
    was_completed       BOOLEAN   DEFAULT FALSE,
    shown_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rec_student  ON wellness_recommendations(student_id);
CREATE INDEX idx_rec_date     ON wellness_recommendations(recommendation_date);
CREATE INDEX idx_rec_priority ON wellness_recommendations(priority);

COMMENT ON TABLE wellness_recommendations IS 'AI-generated personalized wellness tips linked to daily burnout scores';

-- ============================================================
-- TABLE 9: counselor_alerts
-- Anonymous critical alerts triggered by ML model
-- ============================================================
CREATE TABLE counselor_alerts (
    id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Anonymous token (never stores student_id directly to counselor)
    anonymous_token     VARCHAR(64)  NOT NULL UNIQUE,
    -- The actual student_id is encrypted — only system can decrypt
    encrypted_student_id TEXT        NOT NULL,
    -- Alert details
    triggered_score     NUMERIC(5,2) NOT NULL,
    risk_level          risk_level   NOT NULL,
    department          VARCHAR(100),
    year_of_study       SMALLINT,
    -- What triggered the alert (stored as JSON array of strings)
    trigger_reasons     JSONB        NOT NULL DEFAULT '[]',
    -- e.g. ["Sleep < 4h for 5 days", "Exam in 2 days", "Mood = 2/10"]
    -- Firebase FCM delivery
    fcm_sent            BOOLEAN      NOT NULL DEFAULT FALSE,
    fcm_sent_at         TIMESTAMPTZ,
    -- Counselor actions
    alert_status        alert_status NOT NULL DEFAULT 'pending',
    acknowledged_by     UUID         REFERENCES users(id),
    acknowledged_at     TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    counselor_notes     TEXT,
    -- Timestamps
    triggered_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_status    ON counselor_alerts(alert_status);
CREATE INDEX idx_alert_triggered ON counselor_alerts(triggered_at DESC);
CREATE INDEX idx_alert_pending   ON counselor_alerts(alert_status) WHERE alert_status = 'pending';
CREATE INDEX idx_alert_risk      ON counselor_alerts(risk_level);

COMMENT ON TABLE  counselor_alerts IS 'Anonymous burnout alerts sent to counselors via Firebase FCM';
COMMENT ON COLUMN counselor_alerts.anonymous_token IS 'UUID-derived token — counselor sees this, never the student name';
COMMENT ON COLUMN counselor_alerts.encrypted_student_id IS 'AES-encrypted student UUID — only resolvable by admin if consent given';
COMMENT ON COLUMN counselor_alerts.trigger_reasons IS 'JSON array of human-readable reasons that triggered the alert';

-- ============================================================
-- TABLE 10: peer_groups
-- K-Means cluster assignments for study group recommendations
-- ============================================================
CREATE TABLE peer_groups (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id      INTEGER NOT NULL,          -- 0-indexed K-Means cluster
    cluster_label   VARCHAR(100),              -- e.g. "High-Stress GATE Group"
    -- Cluster centroid snapshot (for display)
    centroid_data   JSONB,
    stress_profile  VARCHAR(200),
    match_reason    TEXT,
    -- Meeting schedule
    meeting_day     VARCHAR(20),               -- "Saturday"
    meeting_time    VARCHAR(20),               -- "4:00 PM - 6:00 PM"
    focus_area      VARCHAR(150),              -- "GATE + Cloud Computing"
    -- Members stored as array of user UUIDs
    member_ids      UUID[]  NOT NULL DEFAULT '{}',
    max_members     SMALLINT DEFAULT 6,
    -- Computed from
    kmeans_run_date DATE    NOT NULL DEFAULT CURRENT_DATE,
    model_version   VARCHAR(20) DEFAULT 'kmeans-v1.0',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pg_cluster  ON peer_groups(cluster_id);
CREATE INDEX idx_pg_members  ON peer_groups USING GIN(member_ids);

-- Junction table: student <-> group membership
CREATE TABLE peer_group_members (
    group_id    UUID REFERENCES peer_groups(id) ON DELETE CASCADE,
    student_id  UUID REFERENCES users(id)       ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    PRIMARY KEY (group_id, student_id)
);

CREATE INDEX idx_pgm_student ON peer_group_members(student_id);

COMMENT ON TABLE peer_groups IS 'K-Means cluster output — peer study groups based on stress profile matching';
COMMENT ON COLUMN peer_groups.member_ids IS 'Array of student UUIDs in this cluster (denormalized for fast reads)';

-- ============================================================
-- TABLE 11: resilience_scores
-- Tracks student recovery after burnout episodes
-- ============================================================
CREATE TABLE resilience_scores (
    id                  UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Episode window
    episode_start       DATE      NOT NULL,
    episode_end         DATE,                  -- NULL if still ongoing
    -- Burnout episode details
    peak_burnout_score  NUMERIC(5,2),          -- Highest score during episode
    peak_date           DATE,
    peak_risk_level     risk_level,
    -- Recovery measurement
    recovery_score      NUMERIC(5,2) CHECK (recovery_score BETWEEN 0 AND 100),
    -- 0=No recovery, 100=Full recovery
    recovery_days       INTEGER,               -- Days taken to recover
    -- Post-episode score (7 days after episode_end)
    post_episode_score  NUMERIC(5,2),
    -- Trend
    is_improving        BOOLEAN,
    recovery_notes      TEXT,
    computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rs_student  ON resilience_scores(student_id);
CREATE INDEX idx_rs_episode  ON resilience_scores(episode_start);

COMMENT ON TABLE  resilience_scores IS 'Tracks how fast and how well a student recovers after burnout episodes';
COMMENT ON COLUMN resilience_scores.recovery_score IS '0=No recovery, 100=Full recovery to pre-episode baseline';


-- ============================================================
-- SAMPLE DATA — 8 students, 5 subjects, full data
-- ============================================================

-- ── 1. Users ──────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, full_name, role, college_id, department) VALUES
-- Students (MCA Year 2, Section B)
('a1b2c3d4-0001-0001-0001-000000000001', 'arjun.sharma@university.ac.in',   crypt('pass123', gen_salt('bf')), 'Arjun Sharma',    'student',   'MCA24B47', 'MCA'),
('a1b2c3d4-0002-0002-0002-000000000002', 'priya.krishnan@university.ac.in', crypt('pass123', gen_salt('bf')), 'Priya Krishnan',  'student',   'MCA24B12', 'MCA'),
('a1b2c3d4-0003-0003-0003-000000000003', 'rahul.verma@university.ac.in',    crypt('pass123', gen_salt('bf')), 'Rahul Verma',     'student',   'MCA24B28', 'MCA'),
('a1b2c3d4-0004-0004-0004-000000000004', 'sneha.patel@university.ac.in',    crypt('pass123', gen_salt('bf')), 'Sneha Patel',     'student',   'MCA24B33', 'MCA'),
('a1b2c3d4-0005-0005-0005-000000000005', 'kavya.reddy@university.ac.in',    crypt('pass123', gen_salt('bf')), 'Kavya Reddy',     'student',   'MCA24B09', 'MCA'),
('a1b2c3d4-0006-0006-0006-000000000006', 'nikhil.mehta@university.ac.in',   crypt('pass123', gen_salt('bf')), 'Nikhil Mehta',    'student',   'MCA24B55', 'MCA'),
-- Counselor
('b2c3d4e5-0007-0007-0007-000000000007', 'counselor@university.ac.in',      crypt('counsel123', gen_salt('bf')), 'Dr. Meena Iyer',  'counselor', 'EMP-C001', 'Student Welfare'),
-- Faculty
('c3d4e5f6-0008-0008-0008-000000000008', 'rmehta@university.ac.in',         crypt('faculty123', gen_salt('bf')), 'Dr. R. Mehta',    'faculty',   'EMP-F012', 'MCA');

-- ── 2. Student Profiles ───────────────────────────────────────
INSERT INTO student_profiles (user_id, roll_number, year_of_study, section, placement_anxiety_flag, gate_cat_prep_flag, family_stress_flag, checkin_streak_days, total_checkins, counselor_alert_consent) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'MCA24B47', 2, 'B', TRUE,  TRUE,  FALSE, 14, 28, TRUE),
('a1b2c3d4-0002-0002-0002-000000000002', 'MCA24B12', 2, 'B', FALSE, FALSE, FALSE, 20, 35, TRUE),
('a1b2c3d4-0003-0003-0003-000000000003', 'MCA24B28', 2, 'B', TRUE,  FALSE, TRUE,   3,  8, TRUE),
('a1b2c3d4-0004-0004-0004-000000000004', 'MCA24B33', 2, 'B', TRUE,  TRUE,  FALSE,  9, 18, TRUE),
('a1b2c3d4-0005-0005-0005-000000000005', 'MCA24B09', 2, 'B', FALSE, FALSE, FALSE, 25, 42, TRUE),
('a1b2c3d4-0006-0006-0006-000000000006', 'MCA24B55', 2, 'B', FALSE, TRUE,  FALSE, 30, 51, TRUE);

-- ── 3. Daily Check-ins (last 7 days for Arjun) ───────────────
INSERT INTO daily_checkins (student_id, checkin_date, mood_score, sleep_hours, study_hours, physical_activity_hrs, placement_anxiety, gate_cat_prep, family_stress, social_isolation, stress_notes) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE - 6, 7.0, 6.5, 6.0, 1.0, FALSE, TRUE,  FALSE, FALSE, 'Started GATE prep. Manageable.'),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE - 5, 6.5, 6.0, 7.0, 0.5, TRUE,  TRUE,  FALSE, FALSE, 'Placement briefing today. Slightly anxious.'),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE - 4, 6.0, 5.5, 7.5, 0.5, TRUE,  TRUE,  FALSE, FALSE, 'Two assignments due this week.'),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE - 3, 5.5, 5.0, 8.5, 0.2, TRUE,  TRUE,  FALSE, FALSE, 'Slept late. Exam coming up.'),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE - 2, 5.0, 4.8, 9.0, 0.2, TRUE,  TRUE,  FALSE, FALSE, 'Very stressed. Need a break.'),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE - 1, 4.5, 4.5, 9.5, 0.0, TRUE,  TRUE,  FALSE, FALSE, 'Cannot focus. Exam in 3 days.'),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE,     4.0, 4.5,10.0, 0.2, TRUE,  TRUE,  FALSE, FALSE, 'Feeling burned out. GATE + Cloud Computing exam = nightmare.'),
-- Priya (balanced student)
('a1b2c3d4-0002-0002-0002-000000000002', CURRENT_DATE - 1, 8.0, 7.2, 5.5, 1.5, FALSE, FALSE, FALSE, FALSE, 'Had a great study session. Feeling prepared.'),
('a1b2c3d4-0002-0002-0002-000000000002', CURRENT_DATE,     7.5, 7.0, 5.0, 1.5, FALSE, FALSE, FALSE, FALSE, 'Relaxed and ready for the week.'),
-- Rahul (critical risk)
('a1b2c3d4-0003-0003-0003-000000000003', CURRENT_DATE,     2.0, 3.0, 2.0, 0.0, TRUE,  FALSE, TRUE,  TRUE,  'Feeling terrible. Not attending classes. Family issues severe.');

-- ── 4. Burnout Scores (RF model outputs) ──────────────────────
INSERT INTO burnout_scores (student_id, checkin_id, score_date, burnout_score, risk_level, rf_confidence, prob_low, prob_moderate, prob_high, prob_critical, score_delta, lstm_forecast_7d, exam_stress_pred, model_version) VALUES
-- Arjun - trending upward (worsening)
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE - 6, 47.2, 'Moderate', 0.78, 0.05, 0.68, 0.22, 0.05, NULL,  '[48.1,50.3,53.2,57.1,61.0,65.4,69.2]', 72.1, 'rf-v1.0'),
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE - 5, 52.8, 'Moderate', 0.72, 0.03, 0.58, 0.32, 0.07, +5.6,  '[54.0,56.5,59.8,63.0,66.2,69.5,72.1]', 75.4, 'rf-v1.0'),
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE - 4, 57.4, 'High',     0.75, 0.01, 0.28, 0.61, 0.10, +4.6,  '[59.1,62.0,65.2,68.1,71.0,73.5,75.8]', 79.3, 'rf-v1.0'),
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE - 3, 61.1, 'High',     0.80, 0.01, 0.18, 0.67, 0.14, +3.7,  '[62.5,65.0,68.2,71.5,74.3,77.0,79.5]', 83.1, 'rf-v1.0'),
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE - 2, 65.8, 'High',     0.82, 0.00, 0.12, 0.68, 0.20, +4.7,  '[66.5,69.2,72.0,75.1,78.0,80.5,83.2]', 88.4, 'rf-v1.0'),
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE - 1, 68.3, 'High',     0.83, 0.00, 0.09, 0.66, 0.25, +2.5,  '[69.0,72.1,75.0,78.2,80.5,83.1,85.4]', 92.0, 'rf-v1.0'),
('a1b2c3d4-0001-0001-0001-000000000001', NULL, CURRENT_DATE,     71.2, 'High',     0.84, 0.00, 0.12, 0.60, 0.28, +2.9,  '[71.5,74.2,77.0,79.5,81.3,83.8,86.1]', 96.3, 'rf-v1.0'),
-- Priya (stable, moderate)
('a1b2c3d4-0002-0002-0002-000000000002', NULL, CURRENT_DATE - 1, 38.5, 'Moderate', 0.81, 0.12, 0.74, 0.12, 0.02, NULL,  '[38.0,37.5,37.0,38.2,39.1,38.8,38.5]', 41.2, 'rf-v1.0'),
('a1b2c3d4-0002-0002-0002-000000000002', NULL, CURRENT_DATE,     36.2, 'Moderate', 0.79, 0.15, 0.71, 0.12, 0.02, -2.3,  '[36.0,35.5,36.0,37.0,36.5,36.2,36.0]', 39.8, 'rf-v1.0'),
-- Rahul (critical)
('a1b2c3d4-0003-0003-0003-000000000003', NULL, CURRENT_DATE,     89.4, 'Critical', 0.91, 0.00, 0.02, 0.07, 0.91, NULL,  '[90.1,91.5,93.0,94.2,95.0,95.8,96.5]', 98.1, 'rf-v1.0');

-- ── 5. Exam Timetable ─────────────────────────────────────────
INSERT INTO exam_timetable (department, subject_name, subject_code, exam_date, exam_time, exam_type, duration_mins, stress_weight, uploaded_by) VALUES
('MCA', 'Cloud Computing',       'CC501', CURRENT_DATE + 3,  '10:00', 'university', 180, 1.0, 'c3d4e5f6-0008-0008-0008-000000000008'),
('MCA', 'Machine Learning',      'ML502', CURRENT_DATE + 7,  '10:00', 'university', 180, 1.0, 'c3d4e5f6-0008-0008-0008-000000000008'),
('MCA', 'Data Warehousing',      'DW503', CURRENT_DATE + 12, '10:00', 'university', 180, 1.0, 'c3d4e5f6-0008-0008-0008-000000000008'),
('MCA', 'Software Engineering',  'SE504', CURRENT_DATE + 17, '02:00', 'university', 180, 1.0, 'c3d4e5f6-0008-0008-0008-000000000008'),
('MCA', 'Computer Networks',     'CN505', CURRENT_DATE + 21, '10:00', 'university', 180, 1.0, 'c3d4e5f6-0008-0008-0008-000000000008');

-- ── 6. Attendance Records ─────────────────────────────────────
INSERT INTO attendance_records (student_id, subject_code, subject_name, class_date, is_present, synced_from_erp) VALUES
-- Arjun - Cloud Computing (68% attendance — at risk)
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing', CURRENT_DATE - 10, TRUE,  TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing', CURRENT_DATE - 9,  FALSE, TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing', CURRENT_DATE - 8,  FALSE, TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing', CURRENT_DATE - 7,  TRUE,  TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing', CURRENT_DATE - 5,  FALSE, TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing', CURRENT_DATE - 3,  TRUE,  TRUE),
-- Arjun - Machine Learning (78% attendance — ok)
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning', CURRENT_DATE - 10, TRUE,  TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning', CURRENT_DATE - 9,  TRUE,  TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning', CURRENT_DATE - 8,  FALSE, TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning', CURRENT_DATE - 7,  TRUE,  TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning', CURRENT_DATE - 5,  TRUE,  TRUE),
-- Rahul - Very low attendance (42%)
('a1b2c3d4-0003-0003-0003-000000000003', 'CC501', 'Cloud Computing', CURRENT_DATE - 10, FALSE, TRUE),
('a1b2c3d4-0003-0003-0003-000000000003', 'CC501', 'Cloud Computing', CURRENT_DATE - 9,  FALSE, TRUE),
('a1b2c3d4-0003-0003-0003-000000000003', 'CC501', 'Cloud Computing', CURRENT_DATE - 8,  TRUE,  TRUE),
('a1b2c3d4-0003-0003-0003-000000000003', 'CC501', 'Cloud Computing', CURRENT_DATE - 7,  FALSE, TRUE),
('a1b2c3d4-0003-0003-0003-000000000003', 'CC501', 'Cloud Computing', CURRENT_DATE - 5,  FALSE, TRUE);

-- ── 7. Internal Marks ─────────────────────────────────────────
INSERT INTO internal_marks (student_id, subject_code, subject_name, assessment_name, marks_obtained, max_marks, entered_by, exam_date) VALUES
-- Arjun
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing',      'Unit Test 1',    58, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 30),
('a1b2c3d4-0001-0001-0001-000000000001', 'CC501', 'Cloud Computing',      'Assignment 1',   65, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 20),
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning',     'Unit Test 1',    72, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 28),
('a1b2c3d4-0001-0001-0001-000000000001', 'ML502', 'Machine Learning',     'Assignment 1',   78, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 18),
('a1b2c3d4-0001-0001-0001-000000000001', 'DW503', 'Data Warehousing',     'Unit Test 1',    80, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 25),
-- Priya (higher marks)
('a1b2c3d4-0002-0002-0002-000000000002', 'CC501', 'Cloud Computing',      'Unit Test 1',    84, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 30),
('a1b2c3d4-0002-0002-0002-000000000002', 'ML502', 'Machine Learning',     'Unit Test 1',    88, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 28),
-- Rahul (very low marks)
('a1b2c3d4-0003-0003-0003-000000000003', 'CC501', 'Cloud Computing',      'Unit Test 1',    31, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 30),
('a1b2c3d4-0003-0003-0003-000000000003', 'ML502', 'Machine Learning',     'Unit Test 1',    40, 100, 'c3d4e5f6-0008-0008-0008-000000000008', CURRENT_DATE - 28);

-- ── 8. Wellness Recommendations (for Arjun today) ────────────
INSERT INTO wellness_recommendations (student_id, recommendation_date, category, priority, title, body_text, was_shown) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE, 'sleep',    1, 'Improve Sleep Quality', 'Your 4.5h sleep is critically low. Sleep deprivation is your #1 burnout driver. Target 7-8h tonight — put your phone away at 10 PM.', TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE, 'study',    2, 'Use Pomodoro Technique', 'You are studying 10h straight. Break into 25-min focus + 5-min rest cycles. This improves retention by 40% and reduces fatigue.', TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE, 'mental',   2, '10-Min Mindfulness Now', 'With GATE + placement anxiety, 10 minutes of mindfulness lowers cortisol by 23%. Try Headspace or YouTube guided breathing.', TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE, 'physical', 3, 'Evening Walk Recommended', 'A 30-min evening walk resets your circadian rhythm and improves sleep quality. Do this today — even 10 minutes helps.', FALSE),
('a1b2c3d4-0001-0001-0001-000000000001', CURRENT_DATE, 'social',   3, 'Join Peer Study Group', 'You have been matched with 4 students in Cluster A with similar GATE stress. Studying together reduces isolation and improves outcomes.', FALSE);

-- ── 9. Counselor Alerts ───────────────────────────────────────
INSERT INTO counselor_alerts (anonymous_token, encrypted_student_id, triggered_score, risk_level, department, year_of_study, trigger_reasons, fcm_sent, fcm_sent_at, alert_status) VALUES
-- Rahul - Critical alert (anonymous)
(
    encode(digest('rahul-alert-' || NOW()::TEXT, 'sha256'), 'hex'),
    encode(encrypt('a1b2c3d4-0003-0003-0003-000000000003'::bytea, 'academiccare-secret-key'::bytea, 'aes'), 'hex'),
    89.4, 'Critical', 'MCA', 2,
    '["Sleep < 3h for 3 consecutive days", "Attendance dropped to 42%", "Family stress flag active", "Social isolation flag active", "Exam in 3 days", "Internal marks < 40%"]',
    TRUE, NOW() - INTERVAL '2 hours', 'pending'
),
-- Another anonymous alert (Sneha - High)
(
    encode(digest('sneha-alert-' || NOW()::TEXT, 'sha256'), 'hex'),
    encode(encrypt('a1b2c3d4-0004-0004-0004-000000000004'::bytea, 'academiccare-secret-key'::bytea, 'aes'), 'hex'),
    76.3, 'High', 'MCA', 2,
    '["Sleep averaging 4.8h over 7 days", "Placement anxiety flag active", "GATE prep flag active", "Mood score declined 35% over 2 weeks"]',
    TRUE, NOW() - INTERVAL '5 hours', 'acknowledged'
);

-- ── 10. Peer Groups (K-Means output) ─────────────────────────
INSERT INTO peer_groups (cluster_id, cluster_label, stress_profile, match_reason, meeting_day, meeting_time, focus_area, member_ids, kmeans_run_date) VALUES
(0, 'High-Stress GATE Group',
 'High Burnout + GATE/CAT Preparation Pressure',
 'Students share similar stress patterns during exam weeks with GATE prep overlap',
 'Saturday', '4:00 PM - 6:00 PM', 'GATE + Cloud Computing',
 ARRAY[
   'a1b2c3d4-0001-0001-0001-000000000001'::UUID,
   'a1b2c3d4-0004-0004-0004-000000000004'::UUID
 ],
 CURRENT_DATE),
(1, 'Balanced Achievers',
 'Moderate Burnout + Good Sleep + Strong Academic Performance',
 'Consistent study patterns with manageable stress and good recovery',
 'Wednesday', '5:00 PM - 7:00 PM', 'Machine Learning + Data Science',
 ARRAY[
   'a1b2c3d4-0002-0002-0002-000000000002'::UUID,
   'a1b2c3d4-0005-0005-0005-000000000005'::UUID
 ],
 CURRENT_DATE),
(2, 'Low Stress High Performers',
 'Low Burnout + Excellent Self-Regulation + High Marks',
 'Strong coping mechanisms and time management — peer mentors',
 'Friday', '6:00 PM - 8:00 PM', 'Research + Advanced Projects',
 ARRAY[
   'a1b2c3d4-0006-0006-0006-000000000006'::UUID
 ],
 CURRENT_DATE);

-- ── 11. Resilience Scores (Arjun's past episodes) ────────────
INSERT INTO resilience_scores (student_id, episode_start, episode_end, peak_burnout_score, peak_date, peak_risk_level, recovery_score, recovery_days, post_episode_score, is_improving) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', '2026-03-10', '2026-03-24', 82.3, '2026-03-17', 'Critical', 68.0, 14, 44.5, TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', '2026-04-18', '2026-04-28', 77.1, '2026-04-22', 'High',     74.0, 10, 40.2, TRUE),
('a1b2c3d4-0001-0001-0001-000000000001', '2026-05-15', '2026-05-22', 71.4, '2026-05-18', 'High',     79.0,  7, 38.8, TRUE);


-- ============================================================
-- USEFUL QUERIES for viva demonstration
-- ============================================================

-- Q1: Get full burnout profile for a student
-- SELECT u.full_name, bs.burnout_score, bs.risk_level, bs.score_date,
--        dc.mood_score, dc.sleep_hours, dc.study_hours
-- FROM burnout_scores bs
-- JOIN users u ON u.id = bs.student_id
-- LEFT JOIN daily_checkins dc ON dc.student_id = bs.student_id AND dc.checkin_date = bs.score_date
-- WHERE u.email = 'arjun.sharma@university.ac.in'
-- ORDER BY bs.score_date DESC;

-- Q2: Students with Critical or High risk TODAY
-- SELECT u.full_name, sp.roll_number, bs.burnout_score, bs.risk_level
-- FROM burnout_scores bs
-- JOIN users u ON u.id = bs.student_id
-- JOIN student_profiles sp ON sp.user_id = u.id
-- WHERE bs.score_date = CURRENT_DATE AND bs.risk_level IN ('Critical', 'High')
-- ORDER BY bs.burnout_score DESC;

-- Q3: Attendance % per student per subject (using view)
-- SELECT * FROM student_attendance_summary WHERE student_id = 'a1b2c3d4-0001-0001-0001-000000000001';

-- Q4: Pending counselor alerts
-- SELECT anonymous_token, triggered_score, risk_level, trigger_reasons, triggered_at
-- FROM counselor_alerts WHERE alert_status = 'pending' ORDER BY triggered_score DESC;

-- Q5: Resilience recovery trend for a student
-- SELECT episode_start, episode_end, peak_burnout_score, recovery_score, recovery_days
-- FROM resilience_scores
-- WHERE student_id = 'a1b2c3d4-0001-0001-0001-000000000001'
-- ORDER BY episode_start;

-- ============================================================
-- SCHEMA COMPLETE
-- ============================================================
