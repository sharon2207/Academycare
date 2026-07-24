"""
AcademiCare — ML Engine
========================
Module: Random Forest Burnout Classifier
Trains a Random Forest model on synthetic student data.

Models:
  1. RandomForestClassifier  → Burnout risk level (Low/Moderate/High/Critical)
  2. RandomForestRegressor   → Exact burnout score (0–100)

Tech: Scikit-learn + Pandas + NumPy + Joblib
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report, confusion_matrix,
    mean_absolute_error, r2_score, accuracy_score
)
import joblib
import os
import sys

# ── Add parent to path ────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.data_generator import generate_dataset, FEATURE_COLUMNS

# ─────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────
MODEL_DIR     = 'models'
RF_CLF_PATH   = f'{MODEL_DIR}/random_forest_classifier.pkl'
RF_REG_PATH   = f'{MODEL_DIR}/random_forest_regressor.pkl'
ENCODER_PATH  = f'{MODEL_DIR}/label_encoder.pkl'
N_STUDENTS    = 1000
RANDOM_STATE  = 42

# Risk level ordering for display
RISK_ORDER = ['Low', 'Moderate', 'High', 'Critical']


def print_section(title: str):
    print(f"\n{'═'*60}")
    print(f"  {title}")
    print(f"{'═'*60}")


def train_random_forest():
    """
    Full training pipeline:
    1. Generate synthetic data (1000 students)
    2. Train Random Forest Classifier (risk level)
    3. Train Random Forest Regressor (exact score)
    4. Evaluate both models
    5. Save models to disk
    """

    print_section("AcademiCare — Random Forest Training Pipeline")

    # ── Step 1: Generate Dataset ─────────────────
    print_section("Step 1: Generating Synthetic Dataset")
    df = generate_dataset(N_STUDENTS)

    X = df[FEATURE_COLUMNS].values
    y_class = df['burnout_risk_level'].values
    y_score = df['burnout_score'].values

    # Encode labels
    le = LabelEncoder()
    le.fit(RISK_ORDER)
    y_encoded = le.transform(y_class)

    print(f"\n✅ Feature matrix shape: {X.shape}")
    print(f"   Target classes: {list(le.classes_)}")
    print(f"   Score range: {y_score.min():.1f} – {y_score.max():.1f}")

    # ── Step 2: Train-Test Split ──────────────────
    print_section("Step 2: Train-Test Split (80/20)")
    X_train, X_test, y_cls_train, y_cls_test, y_scr_train, y_scr_test = train_test_split(
        X, y_encoded, y_score, test_size=0.2,
        random_state=RANDOM_STATE, stratify=y_encoded
    )
    print(f"   Training samples : {X_train.shape[0]}")
    print(f"   Testing samples  : {X_test.shape[0]}")

    # ── Step 3: Train Classifier ──────────────────
    print_section("Step 3: Training Random Forest Classifier")
    rf_clf = RandomForestClassifier(
        n_estimators=200,          # 200 decision trees
        max_depth=12,              # Prevents overfitting
        min_samples_leaf=4,        # Minimum leaf samples
        min_samples_split=8,       # Minimum split samples
        class_weight='balanced',   # Handle class imbalance
        random_state=RANDOM_STATE,
        n_jobs=-1                  # Use all CPU cores
    )

    print(f"\n   Training with 200 decision trees...")
    rf_clf.fit(X_train, y_cls_train)
    print(f"   ✅ Classifier trained!")

    # Cross-validation
    print(f"\n   Running 5-Fold Cross-Validation...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(rf_clf, X_train, y_cls_train, cv=skf, scoring='accuracy')
    print(f"   CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"   CV Scores  : {[f'{s:.3f}' for s in cv_scores]}")

    # Test evaluation
    y_pred_cls = rf_clf.predict(X_test)
    test_accuracy = accuracy_score(y_cls_test, y_pred_cls)

    print(f"\n{'─'*60}")
    print(f"  CLASSIFIER EVALUATION RESULTS")
    print(f"{'─'*60}")
    print(f"\n  Test Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    print(f"\n  Classification Report:")
    report = classification_report(
        y_cls_test, y_pred_cls,
        target_names=le.classes_,
        zero_division=0
    )
    print(report)

    print(f"\n  Confusion Matrix:")
    cm = confusion_matrix(y_cls_test, y_pred_cls)
    print(f"  Labels: {list(le.classes_)}")
    print(f"  {cm}")

    # ── Step 4: Feature Importance ────────────────
    print_section("Step 4: Feature Importance Analysis")
    importances = rf_clf.feature_importances_
    fi_df = pd.DataFrame({
        'Feature': FEATURE_COLUMNS,
        'Importance': importances
    }).sort_values('Importance', ascending=False)

    print(f"\n  {'Feature':<25} {'Importance':>10}  {'Bar'}")
    print(f"  {'─'*55}")
    for _, row in fi_df.iterrows():
        bar = '█' * int(row['Importance'] * 200)
        print(f"  {row['Feature']:<25} {row['Importance']:>10.4f}  {bar}")

    # ── Step 5: Train Regressor ───────────────────
    print_section("Step 5: Training Random Forest Regressor (Score Prediction)")
    rf_reg = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        min_samples_leaf=3,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )

    rf_reg.fit(X_train, y_scr_train)
    y_pred_scr = rf_reg.predict(X_test)

    mae = mean_absolute_error(y_scr_test, y_pred_scr)
    r2  = r2_score(y_scr_test, y_pred_scr)

    print(f"\n  ✅ Regressor trained!")
    print(f"\n  REGRESSOR EVALUATION RESULTS")
    print(f"  {'─'*40}")
    print(f"  Mean Absolute Error (MAE) : {mae:.2f} points")
    print(f"  R² Score                  : {r2:.4f}")
    print(f"  Interpretation: On average, predicted score is ±{mae:.1f} from actual")

    # Sample predictions
    print(f"\n  Sample Predictions (first 8 test samples):")
    print(f"  {'Actual Score':>12}  {'Predicted':>10}  {'Actual Level':>14}  {'Pred Level':>12}")
    print(f"  {'─'*55}")
    for i in range(min(8, len(y_scr_test))):
        actual_cls = le.inverse_transform([y_cls_test[i]])[0]
        pred_cls   = le.inverse_transform([y_pred_cls[i]])[0]
        match_sym  = '✓' if actual_cls == pred_cls else '✗'
        print(f"  {y_scr_test[i]:>12.1f}  {y_pred_scr[i]:>10.1f}  {actual_cls:>14}  {pred_cls:>12} {match_sym}")

    # ── Step 6: Save Models ───────────────────────
    print_section("Step 6: Saving Models")
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(rf_clf, RF_CLF_PATH)
    joblib.dump(rf_reg, RF_REG_PATH)
    joblib.dump(le, ENCODER_PATH)

    print(f"  ✅ Models saved to '{MODEL_DIR}/':")
    print(f"     • {RF_CLF_PATH}  (Random Forest Classifier)")
    print(f"     • {RF_REG_PATH}   (Random Forest Regressor)")
    print(f"     • {ENCODER_PATH}       (Label Encoder)")

    return rf_clf, rf_reg, le, fi_df


# ─────────────────────────────────────────────────
# INFERENCE FUNCTION
# ─────────────────────────────────────────────────

def load_models():
    """Load trained models from disk."""
    rf_clf = joblib.load(RF_CLF_PATH)
    rf_reg = joblib.load(RF_REG_PATH)
    le     = joblib.load(ENCODER_PATH)
    return rf_clf, rf_reg, le


def predict_burnout(
    mood_score: float,
    sleep_hours: float,
    study_hours: float,
    attendance_pct: float,
    internal_marks_avg: float,
    days_to_next_exam: int,
    assignment_deadlines: int,
    placement_anxiety: int,
    gate_cat_prep: int,
    family_stress: int,
    social_isolation: int,
    physical_activity_hrs: float
) -> dict:
    """
    Predict burnout risk for a single student.

    Args:
        All 12 feature values (matching FEATURE_COLUMNS order)

    Returns:
        dict with:
          - burnout_score: float (0-100)
          - risk_level: str (Low/Moderate/High/Critical)
          - risk_probabilities: dict of class probabilities
          - top_risk_factors: list of top contributing features
          - recommendation_flags: dict of action triggers
    """
    rf_clf, rf_reg, le = load_models()

    features = np.array([[
        mood_score, sleep_hours, study_hours, attendance_pct,
        internal_marks_avg, days_to_next_exam, assignment_deadlines,
        placement_anxiety, gate_cat_prep, family_stress,
        social_isolation, physical_activity_hrs
    ]])

    # Risk level prediction
    risk_encoded   = rf_clf.predict(features)[0]
    risk_level     = le.inverse_transform([risk_encoded])[0]
    risk_proba     = rf_clf.predict_proba(features)[0]

    # Exact score prediction
    burnout_score  = float(np.clip(rf_reg.predict(features)[0], 0, 100))

    # Class probabilities
    proba_dict = {cls: float(round(p * 100, 1)) for cls, p in zip(le.classes_, risk_proba)}

    # Identify top risk factors
    feature_values = features[0]
    importances    = rf_clf.feature_importances_
    risk_factors   = []

    factor_checks = [
        (sleep_hours < 6,         'sleep_hours',          f'Low sleep ({sleep_hours}h < 6h ideal)'),
        (mood_score < 5,          'mood_score',           f'Low mood score ({mood_score}/10)'),
        (attendance_pct < 75,     'attendance_pct',       f'Low attendance ({attendance_pct:.0f}% < 75%)'),
        (placement_anxiety == 1,  'placement_anxiety',    'Placement season pressure active'),
        (social_isolation == 1,   'social_isolation',     'Social isolation detected'),
        (gate_cat_prep == 1,      'gate_cat_prep',        'GATE/CAT preparation pressure'),
        (family_stress == 1,      'family_stress',        'Family/financial stress active'),
        (study_hours > 8,         'study_hours',          f'Excessive study hours ({study_hours}h/day)'),
        (internal_marks_avg < 60, 'internal_marks_avg',   f'Low internal marks ({internal_marks_avg:.0f}/100)'),
        (days_to_next_exam < 7,   'days_to_next_exam',    f'Exam in {days_to_next_exam} days (critical window)'),
    ]

    for condition, feature_name, description in factor_checks:
        if condition:
            feat_importance = importances[FEATURE_COLUMNS.index(feature_name)]
            risk_factors.append({
                'factor': description,
                'feature': feature_name,
                'importance': round(feat_importance, 3)
            })

    risk_factors.sort(key=lambda x: x['importance'], reverse=True)

    # Recommendation flags
    flags = {
        'send_counselor_alert':     risk_level == 'Critical',
        'send_push_notification':   risk_level in ['High', 'Critical'],
        'recommend_sleep_hygiene':  sleep_hours < 6,
        'recommend_study_break':    study_hours > 8,
        'recommend_peer_group':     social_isolation == 1 or burnout_score > 55,
        'recommend_mindfulness':    mood_score < 5 or burnout_score > 60,
        'flag_for_attendance':      attendance_pct < 75,
        'exam_intervention_alert':  days_to_next_exam < 7 and burnout_score > 60,
    }

    return {
        'burnout_score':       round(burnout_score, 1),
        'risk_level':          risk_level,
        'risk_probabilities':  proba_dict,
        'top_risk_factors':    risk_factors[:5],
        'recommendation_flags': flags,
        'model':               'RandomForestClassifier (200 trees, depth=12)',
        'features_used':       12,
    }


# ─────────────────────────────────────────────────
# DEMO PREDICTIONS
# ─────────────────────────────────────────────────

def run_demo_predictions(rf_clf, rf_reg, le):
    """Run sample predictions on 3 example student profiles."""
    print_section("Demo: Predicting Burnout for Sample Students")

    sample_students = [
        {
            'name':    'Arjun Sharma (MCA Year 2 — GATE + Placement)',
            'mood_score': 4.0,   'sleep_hours': 4.5,  'study_hours': 10.0,
            'attendance_pct': 68, 'internal_marks_avg': 62, 'days_to_next_exam': 3,
            'assignment_deadlines': 4, 'placement_anxiety': 1, 'gate_cat_prep': 1,
            'family_stress': 0, 'social_isolation': 0, 'physical_activity_hrs': 0.2
        },
        {
            'name':    'Priya Krishnan (MCA Year 1 — Balanced)',
            'mood_score': 7.5,   'sleep_hours': 7.2,  'study_hours': 5.5,
            'attendance_pct': 86, 'internal_marks_avg': 79, 'days_to_next_exam': 21,
            'assignment_deadlines': 2, 'placement_anxiety': 0, 'gate_cat_prep': 0,
            'family_stress': 0, 'social_isolation': 0, 'physical_activity_hrs': 1.5
        },
        {
            'name':    'Rahul Verma (MCA Year 3 — Critical Risk)',
            'mood_score': 2.0,   'sleep_hours': 3.0,  'study_hours': 1.5,
            'attendance_pct': 42, 'internal_marks_avg': 35, 'days_to_next_exam': 2,
            'assignment_deadlines': 6, 'placement_anxiety': 1, 'gate_cat_prep': 0,
            'family_stress': 1, 'social_isolation': 1, 'physical_activity_hrs': 0.0
        }
    ]

    for student in sample_students:
        name = student.pop('name')
        features = np.array([[student[f] for f in FEATURE_COLUMNS]])

        risk_encoded = rf_clf.predict(features)[0]
        risk_level   = le.inverse_transform([risk_encoded])[0]
        risk_proba   = rf_clf.predict_proba(features)[0]
        score        = float(np.clip(rf_reg.predict(features)[0], 0, 100))

        proba_str = ' | '.join([f"{cls}: {p*100:.0f}%" for cls, p in zip(le.classes_, risk_proba)])

        print(f"\n  👤 {name}")
        print(f"     Burnout Score : {score:.1f} / 100")
        print(f"     Risk Level    : {risk_level}")
        print(f"     Probabilities : {proba_str}")
        print(f"     Input Summary : Mood={student['mood_score']} | Sleep={student['sleep_hours']}h | Attend={student['attendance_pct']}%")


if __name__ == '__main__':
    # Train the models
    rf_clf, rf_reg, le, fi_df = train_random_forest()

    # Run demo predictions
    run_demo_predictions(rf_clf, rf_reg, le)

    print(f"\n{'═'*60}")
    print(f"  ✅ AcademiCare Random Forest Training Complete!")
    print(f"  Models ready for FastAPI inference endpoint")
    print(f"{'═'*60}\n")
