"""
AcademiCare — ML Engine
========================
Module: K-Means Peer Group Clustering
Groups students by stress patterns for peer study recommendations.

Module: Pearson Correlation — Faculty Deadline Analysis
Links assignment deadlines to collective stress spikes.

Module: Regression — Exam-Day Stress Prediction

Tech: Scikit-learn + SciPy + NumPy + Pandas
"""

import numpy as np
import pandas as pd
from scipy.stats import pearsonr
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import silhouette_score
import joblib
import os

# ─────────────────────────────────────────────────
# FEATURE COLUMNS for clustering
# ─────────────────────────────────────────────────
CLUSTER_FEATURES = [
    'avg_burnout_score',
    'avg_mood_score',
    'avg_sleep_hours',
    'avg_study_hours',
    'placement_anxiety',
    'gate_cat_prep',
    'social_isolation',
    'avg_attendance_pct',
]


def print_section(title: str):
    print(f"\n{'═'*60}")
    print(f"  {title}")
    print(f"{'═'*60}")


# ═════════════════════════════════════════════════
# MODEL 5: K-MEANS CLUSTERING (Peer Study Groups)
# ═════════════════════════════════════════════════

def run_kmeans_clustering(student_df: pd.DataFrame, n_clusters: int = 4) -> dict:
    """
    Cluster students into study groups based on stress profiles.

    Args:
        student_df: DataFrame with columns matching CLUSTER_FEATURES
        n_clusters: number of peer groups to form (default 4)

    Returns:
        dict with cluster assignments, centroids, silhouette score, profiles
    """
    print_section("Model 5: K-Means Peer Group Clustering")

    # Check available features
    available = [f for f in CLUSTER_FEATURES if f in student_df.columns]
    print(f"\n  Students     : {len(student_df)}")
    print(f"  Features     : {len(available)} → {available}")
    print(f"  Target groups: {n_clusters} clusters")

    X = student_df[available].values

    # Standardize features (crucial for K-Means)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print(f"\n  ✅ Features standardized (mean=0, std=1)")

    # ── Find optimal k using Elbow + Silhouette ──
    print(f"\n  Finding optimal number of clusters (k=2 to 7):")
    best_k, best_sil = n_clusters, -1
    sil_scores = {}

    for k in range(2, 8):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels)
        sil_scores[k] = round(sil, 4)
        print(f"    k={k}: Silhouette Score = {sil:.4f} {'← Best so far' if sil > best_sil else ''}")
        if sil > best_sil:
            best_sil, best_k = sil, k

    print(f"\n  ✅ Optimal k = {best_k} (Silhouette = {best_sil:.4f})")

    # ── Train final K-Means ──────────────────────
    final_km = KMeans(n_clusters=best_k, random_state=42, n_init=20, max_iter=500)
    cluster_labels = final_km.fit_predict(X_scaled)
    centroids = scaler.inverse_transform(final_km.cluster_centers_)

    # Save model
    os.makedirs('models', exist_ok=True)
    joblib.dump(final_km, 'models/kmeans_model.pkl')
    joblib.dump(scaler, 'models/kmeans_scaler.pkl')

    # ── Analyze clusters ─────────────────────────
    student_df = student_df.copy()
    student_df['cluster'] = cluster_labels

    print(f"\n  {'─'*55}")
    print(f"  CLUSTER PROFILES")
    print(f"  {'─'*55}")

    cluster_profiles = {}
    for c in range(best_k):
        grp = student_df[student_df['cluster'] == c]
        n   = len(grp)

        if 'avg_burnout_score' in grp.columns:
            avg_burnout = grp['avg_burnout_score'].mean()
        else:
            avg_burnout = np.nan

        # Characterize cluster
        if avg_burnout >= 70:
            name = f"Cluster {c+1}: Critical Burnout Group"
            tag  = "Urgent counselor intervention needed"
        elif avg_burnout >= 50:
            name = f"Cluster {c+1}: High-Stress Achievers"
            tag  = "Needs stress management + peer support"
        elif avg_burnout >= 30:
            name = f"Cluster {c+1}: Moderate Stress Learners"
            tag  = "Preventive wellness tips recommended"
        else:
            name = f"Cluster {c+1}: Well-Balanced Students"
            tag  = "Role models — can mentor other groups"

        profile = {
            'id':          c,
            'name':        name,
            'tag':         tag,
            'size':        n,
            'avg_burnout': round(avg_burnout, 1) if not np.isnan(avg_burnout) else 0,
            'centroid':    {feat: round(float(centroids[c][i]), 2)
                           for i, feat in enumerate(available)}
        }
        cluster_profiles[c] = profile

        print(f"\n  {name}")
        print(f"  Tag         : {tag}")
        print(f"  Students    : {n}")
        if not np.isnan(avg_burnout):
            print(f"  Avg Burnout : {avg_burnout:.1f}/100")
        print(f"  Centroid (top features):")
        for feat, val in list(profile['centroid'].items())[:4]:
            print(f"    {feat:<28} {val:.2f}")

    return {
        'best_k':           best_k,
        'silhouette_score': best_sil,
        'sil_scores':       sil_scores,
        'cluster_labels':   cluster_labels.tolist(),
        'cluster_profiles': cluster_profiles,
        'model_saved':      'models/kmeans_model.pkl'
    }


def assign_student_to_cluster(student_features: dict) -> dict:
    """Assign a new student to an existing cluster."""
    km     = joblib.load('models/kmeans_model.pkl')
    scaler = joblib.load('models/kmeans_scaler.pkl')

    X = np.array([[student_features.get(f, 0) for f in CLUSTER_FEATURES]])
    X_scaled = scaler.transform(X)
    cluster_id = int(km.predict(X_scaled)[0])
    distances  = km.transform(X_scaled)[0]

    return {
        'assigned_cluster': cluster_id,
        'distance_to_centroid': round(float(distances[cluster_id]), 3),
        'distances_all': {i: round(float(d), 3) for i, d in enumerate(distances)}
    }


# ═════════════════════════════════════════════════
# MODEL 4: PEARSON CORRELATION (Faculty Deadlines)
# ═════════════════════════════════════════════════

def analyze_faculty_deadline_correlation(
    deadline_dates: list,
    daily_stress_series: dict  # {student_id: [score_day_1, ..., score_day_N]}
) -> list:
    """
    Correlates faculty assignment deadline dates with batch stress spikes.

    Args:
        deadline_dates: list of date strings 'YYYY-MM-DD'
        daily_stress_series: dict mapping student_id → daily burnout scores

    Returns:
        List of results with Pearson r, p-value, spike magnitude
    """
    print_section("Model 4: Pearson Correlation — Faculty Deadline Analysis")

    n_days = max(len(v) for v in daily_stress_series.values())
    n_students = len(daily_stress_series)

    # Compute batch average daily stress
    stress_matrix = np.zeros((n_students, n_days))
    for i, (sid, scores) in enumerate(daily_stress_series.items()):
        stress_matrix[i, :len(scores)] = scores

    batch_avg_stress = stress_matrix.mean(axis=0)
    print(f"\n  Students analyzed : {n_students}")
    print(f"  Days tracked      : {n_days}")
    print(f"  Deadline events   : {len(deadline_dates)}")

    results = []
    for deadline in deadline_dates:
        # Build binary indicator vector: 1 on deadline day, 0 otherwise
        # (simplified: use day index relative to start)
        deadline_day = int(deadline.split('-')[-1]) % n_days  # simplification

        # Stress window around deadline: days -3 to +3
        window_start = max(0, deadline_day - 3)
        window_end   = min(n_days, deadline_day + 4)

        if window_end - window_start < 4:
            continue

        # Deadline indicator (1s around deadline, 0s elsewhere in window)
        indicator = np.zeros(window_end - window_start)
        mid = deadline_day - window_start
        if 0 <= mid < len(indicator):
            indicator[mid] = 1
            if mid > 0: indicator[mid-1] = 0.5
            if mid < len(indicator)-1: indicator[mid+1] = 0.5

        stress_window = batch_avg_stress[window_start:window_end]

        if len(indicator) != len(stress_window) or len(indicator) < 3:
            continue

        try:
            r, p_value = pearsonr(indicator, stress_window)
            spike_mag = stress_window[mid] - stress_window.mean() if 0 <= mid < len(stress_window) else 0

            results.append({
                'deadline_date':    deadline,
                'pearson_r':        round(float(r), 3),
                'p_value':          round(float(p_value), 4),
                'significant':      p_value < 0.05,
                'stress_spike':     round(float(spike_mag), 1),
                'interpretation':   interpret_correlation(r)
            })
        except Exception:
            continue

    # Sort by |r| descending
    results.sort(key=lambda x: abs(x['pearson_r']), reverse=True)

    print(f"\n  {'Deadline':<12}  {'r':>6}  {'p-value':>8}  {'Spike':>6}  {'Significance'}")
    print(f"  {'─'*60}")
    for res in results[:10]:
        sig = '✓ Significant' if res['significant'] else '✗ Not sig.'
        print(f"  {res['deadline_date']:<12}  {res['pearson_r']:>6.3f}  {res['p_value']:>8.4f}  {res['stress_spike']:>+6.1f}  {sig}")

    return results


def interpret_correlation(r: float) -> str:
    """Interpret Pearson r value."""
    abs_r = abs(r)
    if abs_r >= 0.8:   return 'Very Strong Correlation — Major burnout trigger'
    elif abs_r >= 0.6: return 'Strong Correlation — Significant stress spike'
    elif abs_r >= 0.4: return 'Moderate Correlation — Notable stress effect'
    elif abs_r >= 0.2: return 'Weak Correlation — Minor stress effect'
    else:              return 'Very Weak/No Correlation'


# ═════════════════════════════════════════════════
# MODEL 3: REGRESSION (Exam-Day Stress Prediction)
# ═════════════════════════════════════════════════

def train_exam_stress_regressor(historical_exam_data: list) -> dict:
    """
    Train a regression model to predict exam-day burnout score.

    Features:
      - current_burnout_score (trend before exam)
      - days_to_exam
      - avg_sleep_last_7_days
      - avg_study_last_7_days
      - exam_weight (internal = 0.4, university = 1.0)
      - past_exam_stress_avg (student's historical exam stress)

    Target: burnout_score_on_exam_day
    """
    print_section("Model 3: Regression — Exam-Day Stress Prediction")

    np.random.seed(42)
    n_records = 500

    # Generate synthetic exam records
    data = []
    for _ in range(n_records):
        current_burnout   = np.random.uniform(20, 80)
        days_to_exam      = np.random.randint(1, 30)
        avg_sleep         = np.random.uniform(4, 8)
        avg_study         = np.random.uniform(3, 12)
        exam_weight       = np.random.choice([0.4, 0.7, 1.0])  # internal / mid / final
        past_avg_stress   = np.random.uniform(40, 85)

        # Exam-day stress formula (ground truth)
        exam_stress = (
            current_burnout * 0.45
            + (15 - min(days_to_exam, 15)) * 1.8
            + (7.0 - avg_sleep) * 4.2
            + (avg_study - 5) * 1.1
            + exam_weight * 15
            + past_avg_stress * 0.25
            + np.random.normal(0, 4)
        )
        exam_stress = np.clip(exam_stress, 0, 100)

        data.append({
            'current_burnout':   current_burnout,
            'days_to_exam':      days_to_exam,
            'avg_sleep':         avg_sleep,
            'avg_study':         avg_study,
            'exam_weight':       exam_weight,
            'past_avg_stress':   past_avg_stress,
            'exam_day_stress':   exam_stress
        })

    df = pd.DataFrame(data)
    feature_cols = ['current_burnout', 'days_to_exam', 'avg_sleep', 'avg_study', 'exam_weight', 'past_avg_stress']
    X = df[feature_cols].values
    y = df['exam_day_stress'].values

    # Split and train
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    reg = LinearRegression()
    reg.fit(X_train, y_train)

    y_pred = reg.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    r2   = r2_score(y_test, y_pred)

    print(f"\n  Training samples   : {len(X_train)}")
    print(f"  Test samples       : {len(X_test)}")
    print(f"  MAE                : {mae:.2f} score points")
    print(f"  R² Score           : {r2:.4f}")
    print(f"\n  Feature Coefficients:")
    for feat, coeff in zip(feature_cols, reg.coef_):
        print(f"    {feat:<25} {coeff:>+8.3f}")
    print(f"    {'Intercept':<25} {reg.intercept_:>+8.3f}")

    # Save
    os.makedirs('models', exist_ok=True)
    joblib.dump(reg, 'models/exam_stress_regressor.pkl')
    print(f"\n  ✅ Regressor saved → models/exam_stress_regressor.pkl")

    # Demo predictions
    print(f"\n  Sample Predictions:")
    print(f"  {'Current':>8}  {'DaysLeft':>8}  {'Sleep':>6}  {'Actual':>8}  {'Predicted':>10}")
    print(f"  {'─'*50}")
    for i in range(min(6, len(X_test))):
        print(f"  {X_test[i,0]:>8.1f}  {X_test[i,1]:>8.0f}  {X_test[i,2]:>6.1f}  {y_test[i]:>8.1f}  {y_pred[i]:>10.1f}")

    return {
        'mae': round(mae, 2),
        'r2':  round(r2, 4),
        'feature_coefficients': {f: round(float(c), 3) for f, c in zip(feature_cols, reg.coef_)},
        'model_saved': 'models/exam_stress_regressor.pkl'
    }


def predict_exam_stress(
    current_burnout: float,
    days_to_exam: int,
    avg_sleep: float,
    avg_study: float,
    exam_weight: float = 1.0,
    past_avg_stress: float = 60.0
) -> dict:
    """Predict stress score on exam day."""
    reg = joblib.load('models/exam_stress_regressor.pkl')
    X = np.array([[current_burnout, days_to_exam, avg_sleep, avg_study, exam_weight, past_avg_stress]])
    score = float(np.clip(reg.predict(X)[0], 0, 100))
    risk  = 'Critical' if score>=75 else 'High' if score>=55 else 'Moderate' if score>=30 else 'Low'

    return {
        'predicted_exam_stress': round(score, 1),
        'risk_level': risk,
        'days_to_exam': days_to_exam,
        'recommendation': (
            'URGENT: Mandatory counseling before exam' if risk == 'Critical' else
            'Take study breaks, improve sleep by 1h tonight' if risk == 'High' else
            'Monitor daily. Moderate prep strategy suggested' if risk == 'Moderate' else
            'On track. Maintain current wellness habits'
        )
    }


# ─────────────────────────────────────────────────
# MAIN: Run all 3 models
# ─────────────────────────────────────────────────
if __name__ == '__main__':
    import random
    np.random.seed(42)
    random.seed(42)

    # ── K-Means Demo ─────────────────────────────
    n_students = 64
    student_profiles = pd.DataFrame({
        'student_id':       [f'S{i:03d}' for i in range(n_students)],
        'avg_burnout_score': np.clip(np.random.normal(52, 20, n_students), 5, 98),
        'avg_mood_score':    np.clip(np.random.normal(6.0, 1.5, n_students), 1, 10),
        'avg_sleep_hours':   np.clip(np.random.normal(6.2, 1.2, n_students), 3, 10),
        'avg_study_hours':   np.clip(np.random.normal(5.8, 2.0, n_students), 1, 14),
        'placement_anxiety': np.random.randint(0, 2, n_students),
        'gate_cat_prep':     np.random.randint(0, 2, n_students),
        'social_isolation':  np.random.randint(0, 2, n_students),
        'avg_attendance_pct':np.clip(np.random.normal(75, 15, n_students), 30, 100),
    })

    kmeans_result = run_kmeans_clustering(student_profiles)

    # ── Pearson Correlation Demo ──────────────────
    deadlines = ['2026-06-05', '2026-06-12', '2026-06-19', '2026-06-26', '2026-07-03']
    daily_stress = {
        f'S{i:03d}': np.clip(np.random.normal(50+i%10, 10, 60), 10, 95).tolist()
        for i in range(20)
    }
    pearson_results = analyze_faculty_deadline_correlation(deadlines, daily_stress)

    # ── Regression Demo ───────────────────────────
    reg_results = train_exam_stress_regressor([])

    # Sample prediction
    exam_pred = predict_exam_stress(
        current_burnout=67.0,
        days_to_exam=3,
        avg_sleep=5.2,
        avg_study=7.8,
        exam_weight=1.0,
        past_avg_stress=72.0
    )
    print(f"\n  ─── Exam-Day Stress Prediction for Arjun Sharma ───")
    print(f"  Predicted Stress : {exam_pred['predicted_exam_stress']}/100")
    print(f"  Risk Level       : {exam_pred['risk_level']}")
    print(f"  Recommendation   : {exam_pred['recommendation']}")

    print(f"\n{'═'*60}")
    print(f"  ✅ All 3 Models Complete!")
    print(f"     • K-Means         → Peer group clusters")
    print(f"     • Pearson Corr    → Faculty deadline analysis")
    print(f"     • Regression      → Exam-day stress prediction")
    print(f"{'═'*60}\n")
