"""
AcademiCare — ML Engine
========================
Module: Synthetic Dataset Generator
Generates realistic student records for model training.

Tech: Python + NumPy + Pandas
"""

import numpy as np
import pandas as pd
import random

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

FEATURE_COLUMNS = [
    'mood_score',            # 1-10
    'sleep_hours',           # 0-12
    'study_hours',           # 0-16
    'attendance_pct',        # 0-100
    'internal_marks_avg',    # 0-100
    'days_to_next_exam',     # 0-90
    'assignment_deadlines',  # count per week
    'placement_anxiety',     # 0 or 1
    'gate_cat_prep',         # 0 or 1
    'family_stress',         # 0 or 1
    'social_isolation',      # 0 or 1
    'physical_activity_hrs', # 0-4 hrs/day
    'social_media_hours',    # 0-10 hrs/day
]

TARGET_COLUMN = 'burnout_risk_level'   # Low / Moderate / High / Critical
SCORE_COLUMN  = 'burnout_score'        # 0-100
RISK_ORDER    = ['Low', 'Moderate', 'High', 'Critical']


def engineer_features(df_or_dict):
    """
    Feature engineering pipeline.
    Constructs domain-specific interaction features.
    """
    if isinstance(df_or_dict, dict):
        d = df_or_dict
        mood          = d['mood_score']
        sleep         = d['sleep_hours']
        study         = d['study_hours']
        attendance    = d['attendance_pct']
        marks         = d['internal_marks_avg']
        days_exam     = d['days_to_next_exam']
        deadlines     = d['assignment_deadlines']
        placement     = d['placement_anxiety']
        gate          = d['gate_cat_prep']
        family        = d['family_stress']
        isolation     = d['social_isolation']
        activity      = d.get('physical_activity_hrs', d.get('physical_activity', 0))
        social_media  = d['social_media_hours']

        sleep_deficit       = max(0.0, 7.0 - sleep)
        study_overwork      = max(0.0, study - 7.0)
        study_sleep_ratio   = study / (sleep + 0.1)
        academic_deficit    = max(0.0, 75.0 - attendance) * 0.4 + max(0.0, 65.0 - marks) * 0.6
        stress_flags_sum    = placement + gate + family + isolation
        screentime_excess   = max(0.0, social_media - 2.0)

        return np.array([[
            mood, sleep, study, attendance, marks, days_exam, deadlines,
            placement, gate, family, isolation, activity, social_media,
            sleep_deficit, study_overwork, study_sleep_ratio,
            academic_deficit, stress_flags_sum, screentime_excess
        ]])

    f_mat = df_or_dict[FEATURE_COLUMNS].copy()
    f_mat['sleep_deficit'] = np.maximum(0, 7.0 - f_mat['sleep_hours'])
    f_mat['study_overwork'] = np.maximum(0, f_mat['study_hours'] - 7.0)
    f_mat['study_sleep_ratio'] = f_mat['study_hours'] / (f_mat['sleep_hours'] + 0.1)
    f_mat['academic_deficit'] = np.maximum(0, 75.0 - f_mat['attendance_pct']) * 0.4 + np.maximum(0, 65.0 - f_mat['internal_marks_avg']) * 0.6
    f_mat['stress_flags_sum'] = f_mat['placement_anxiety'] + f_mat['gate_cat_prep'] + f_mat['family_stress'] + f_mat['social_isolation']
    f_mat['screentime_excess'] = np.maximum(0, f_mat['social_media_hours'] - 2.0)
    return f_mat.values


def generate_student_profile(student_id: int) -> dict:
    archetype = random.choices(
        ['balanced', 'overworked', 'struggling', 'high_achiever', 'at_risk'],
        weights=[0.25, 0.25, 0.20, 0.15, 0.15]
    )[0]

    if archetype == 'balanced':
        mood          = np.clip(np.random.normal(7.2, 1.0), 1, 10)
        sleep         = np.clip(np.random.normal(7.0, 0.8), 4, 9)
        study         = np.clip(np.random.normal(5.5, 1.2), 2, 10)
        attendance    = np.clip(np.random.normal(82, 8), 60, 100)
        marks         = np.clip(np.random.normal(75, 8), 50, 100)
        placement     = int(random.random() < 0.3)
        gate_cat      = int(random.random() < 0.2)
        family_stress = int(random.random() < 0.15)
        isolation     = int(random.random() < 0.1)
        activity      = np.clip(np.random.normal(1.2, 0.4), 0, 3)
        social_media  = np.clip(np.random.normal(1.8, 0.6), 0, 8)

    elif archetype == 'overworked':
        mood          = np.clip(np.random.normal(5.5, 1.5), 1, 10)
        sleep         = np.clip(np.random.normal(5.0, 1.0), 2, 7)
        study         = np.clip(np.random.normal(9.5, 1.5), 6, 16)
        attendance    = np.clip(np.random.normal(78, 10), 55, 100)
        marks         = np.clip(np.random.normal(70, 10), 45, 100)
        placement     = int(random.random() < 0.5)
        gate_cat      = int(random.random() < 0.6)
        family_stress = int(random.random() < 0.3)
        isolation     = int(random.random() < 0.2)
        activity      = np.clip(np.random.normal(0.4, 0.3), 0, 1.5)
        social_media  = np.clip(np.random.normal(2.2, 0.8), 0, 8)

    elif archetype == 'struggling':
        mood          = np.clip(np.random.normal(4.0, 1.5), 1, 8)
        sleep         = np.clip(np.random.normal(4.5, 1.2), 2, 7)
        study         = np.clip(np.random.normal(3.5, 1.5), 0, 8)
        attendance    = np.clip(np.random.normal(62, 12), 30, 85)
        marks         = np.clip(np.random.normal(52, 12), 25, 75)
        placement     = int(random.random() < 0.6)
        gate_cat      = int(random.random() < 0.3)
        family_stress = int(random.random() < 0.5)
        isolation     = int(random.random() < 0.4)
        activity      = np.clip(np.random.normal(0.3, 0.3), 0, 1.0)
        social_media  = np.clip(np.random.normal(4.8, 1.5), 0, 10)

    elif archetype == 'high_achiever':
        mood          = np.clip(np.random.normal(7.8, 0.8), 5, 10)
        sleep         = np.clip(np.random.normal(6.5, 0.7), 5, 9)
        study         = np.clip(np.random.normal(7.0, 1.2), 4, 12)
        attendance    = np.clip(np.random.normal(91, 5), 80, 100)
        marks         = np.clip(np.random.normal(85, 6), 70, 100)
        placement     = int(random.random() < 0.4)
        gate_cat      = int(random.random() < 0.5)
        family_stress = int(random.random() < 0.1)
        isolation     = int(random.random() < 0.05)
        activity      = np.clip(np.random.normal(1.0, 0.4), 0, 2.5)
        social_media  = np.clip(np.random.normal(1.4, 0.5), 0, 5)

    else:  # at_risk
        mood          = np.clip(np.random.normal(2.5, 1.0), 1, 5)
        sleep         = np.clip(np.random.normal(3.5, 1.0), 1, 6)
        study         = np.clip(np.random.normal(2.0, 1.5), 0, 6)
        attendance    = np.clip(np.random.normal(48, 15), 10, 70)
        marks         = np.clip(np.random.normal(38, 12), 15, 60)
        placement     = int(random.random() < 0.7)
        gate_cat      = int(random.random() < 0.2)
        family_stress = int(random.random() < 0.7)
        isolation     = int(random.random() < 0.8)
        activity      = np.clip(np.random.normal(0.1, 0.2), 0, 0.8)
        social_media  = np.clip(np.random.normal(6.2, 2.0), 1, 10)

    days_to_exam  = random.randint(0, 90)
    deadlines     = random.randint(0, 8)

    exam_multiplier = 1.0
    if days_to_exam < 7:
        exam_multiplier = 1.3
    elif days_to_exam < 14:
        exam_multiplier = 1.15

    score = 30.0
    score += (7.0 - sleep) * 3.2
    score += (5.5 - mood) * 2.5
    score += max(0, (study - 7.0)) * 1.5
    score += max(0, (75 - attendance)) * 0.3
    score += max(0, (65 - marks)) * 0.25
    score += deadlines * 0.9
    score += max(0, (social_media - 2.0)) * 1.8
    score += placement * 7.0
    score += gate_cat  * 6.0
    score += family_stress * 4.5
    score += isolation * 6.5
    score -= activity * 3.0
    score *= exam_multiplier
    score += np.random.normal(0, 1.5)
    score = np.clip(score, 0, 100)
    score = round(score, 2)

    if score < 30:
        risk_level = 'Low'
    elif score < 55:
        risk_level = 'Moderate'
    elif score < 75:
        risk_level = 'High'
    else:
        risk_level = 'Critical'

    return {
        'student_id':           f'STU-{student_id:04d}',
        'archetype':            archetype,
        'mood_score':           round(mood, 1),
        'sleep_hours':          round(sleep, 1),
        'study_hours':          round(study, 1),
        'attendance_pct':       round(attendance, 1),
        'internal_marks_avg':   round(marks, 1),
        'days_to_next_exam':    days_to_exam,
        'assignment_deadlines': deadlines,
        'placement_anxiety':    placement,
        'gate_cat_prep':        gate_cat,
        'family_stress':        family_stress,
        'social_isolation':     isolation,
        'physical_activity_hrs': round(activity, 1),
        'social_media_hours':    round(social_media, 1),
        'burnout_score':        score,
        'burnout_risk_level':   risk_level,
    }


def generate_dataset(n_students: int = 5000) -> pd.DataFrame:
    records = [generate_student_profile(i + 1) for i in range(n_students)]
    df = pd.DataFrame(records)
    return df
