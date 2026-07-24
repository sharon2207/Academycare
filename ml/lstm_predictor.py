"""
AcademiCare — ML Engine
========================
Module: LSTM Time-Series Stress Predictor
Predicts burnout score trajectory for next 7 days
using 14-30 day rolling window of student wellness data.

Architecture:
  Input  → LSTM(64) → Dropout(0.2) → LSTM(32) → Dropout(0.2)
         → Dense(16, relu) → Dense(7, linear)
  Output → 7-day burnout score predictions

Tech: TensorFlow/Keras + NumPy + Pandas
"""

import numpy as np
import pandas as pd
import os
import json
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────
# Try to import TensorFlow; gracefully skip if unavailable
# ─────────────────────────────────────────────────
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    from tensorflow.keras.optimizers import Adam
    TF_AVAILABLE = True
    print(f"  TensorFlow version: {tf.__version__}")
except ImportError:
    TF_AVAILABLE = False
    print("  ⚠ TensorFlow not installed. Run: pip install tensorflow")
    print("  ⚠ Using NumPy-based fallback LSTM approximation for demo.")

# ─────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────
WINDOW_SIZE   = 14     # 14-day rolling input window
PREDICT_DAYS  = 7      # Predict next 7 days
N_SEQUENCES   = 800    # Training sequences
MODEL_PATH    = 'models/lstm_stress_predictor.keras'
RANDOM_STATE  = 42

# Features used in LSTM sequence
# Each timestep has 4 values: [burnout_score, mood, sleep, study_hours]
LSTM_FEATURES = ['burnout_score', 'mood_score', 'sleep_hours', 'study_hours']
N_FEATURES    = len(LSTM_FEATURES)


def print_section(title: str):
    print(f"\n{'═'*60}")
    print(f"  {title}")
    print(f"{'═'*60}")


# ─────────────────────────────────────────────────
# STEP 1: GENERATE LSTM TRAINING SEQUENCES
# ─────────────────────────────────────────────────

def generate_student_time_series(n_days: int = 90) -> np.ndarray:
    """
    Generate one student's 90-day wellness time series.
    Simulates realistic patterns:
    - Weekday/weekend variation
    - Exam week stress spikes
    - Gradual burnout accumulation
    - Recovery periods
    """
    series = np.zeros((n_days, N_FEATURES))

    # Start values
    burnout = np.random.uniform(20, 50)
    mood    = np.random.uniform(5, 8)
    sleep   = np.random.uniform(6, 8)
    study   = np.random.uniform(4, 7)

    # Exam weeks (random 3-4 times per 90 days)
    exam_weeks = sorted(random_exam_weeks(n_days))

    for day in range(n_days):
        # Weekend effect (lower study, better sleep)
        is_weekend = day % 7 in [5, 6]
        weekend_bonus = 0.5 if is_weekend else 0

        # Exam proximity effect
        days_to_exam = min([abs(day - ew) for ew in exam_weeks], default=90)
        exam_stress  = max(0, (10 - days_to_exam) * 2.5) if days_to_exam < 10 else 0

        # Drift with noise
        mood_drift    = np.random.normal(0, 0.4)
        sleep_drift   = np.random.normal(weekend_bonus * 0.3, 0.3)
        study_drift   = np.random.normal(-weekend_bonus * 0.5, 0.5)
        burnout_drift = np.random.normal(0, 2.0)

        # Update with constraints
        mood    = np.clip(mood    + mood_drift,    1.0, 10.0)
        sleep   = np.clip(sleep   + sleep_drift,   2.0, 11.0)
        study   = np.clip(study   + study_drift,   0.0, 14.0)
        burnout = np.clip(
            burnout + burnout_drift + exam_stress
            - (mood - 5.0) * 0.8 + (7.0 - sleep) * 1.2,
            0.0, 100.0
        )

        series[day] = [burnout, mood, sleep, study]

    return series


def random_exam_weeks(n_days: int) -> list:
    """Generate 3-4 random exam days within the period."""
    n_exams = np.random.randint(3, 5)
    return sorted(np.random.choice(range(14, n_days - 7), size=n_exams, replace=False))


def generate_lstm_sequences() -> tuple:
    """
    Generate (X, y) pairs for LSTM training.
    X: (N, WINDOW_SIZE, N_FEATURES) — 14 days of input
    y: (N, PREDICT_DAYS)            — 7 days of burnout scores
    """
    print(f"\n  Generating {N_SEQUENCES} time-series sequences...")

    X_all, y_all = [], []

    for _ in range(N_SEQUENCES):
        series = generate_student_time_series(n_days=90)

        # Normalize each feature to [0, 1]
        series_norm = series.copy()
        series_norm[:, 0] /= 100.0  # burnout_score
        series_norm[:, 1] /= 10.0   # mood_score
        series_norm[:, 2] /= 12.0   # sleep_hours
        series_norm[:, 3] /= 16.0   # study_hours

        # Slide window across the 90-day series
        max_start = len(series) - WINDOW_SIZE - PREDICT_DAYS
        if max_start <= 0:
            continue

        start = np.random.randint(0, max_start)
        X_seq = series_norm[start:start + WINDOW_SIZE]               # (14, 4)
        y_seq = series[start + WINDOW_SIZE:start + WINDOW_SIZE + PREDICT_DAYS, 0]  # (7,) raw burnout

        X_all.append(X_seq)
        y_all.append(y_seq)

    X = np.array(X_all)  # (N, 14, 4)
    y = np.array(y_all)  # (N, 7)

    print(f"  ✅ X shape: {X.shape}  →  {WINDOW_SIZE}-day windows × {N_FEATURES} features")
    print(f"  ✅ y shape: {y.shape}  →  {PREDICT_DAYS}-day burnout score forecasts")
    return X, y


# ─────────────────────────────────────────────────
# STEP 2: BUILD LSTM MODEL
# ─────────────────────────────────────────────────

def build_lstm_model() -> 'keras.Model':
    """
    LSTM Architecture:
    Input(14, 4) → LSTM(64, return_sequences=True)
                → Dropout(0.2)
                → LSTM(32, return_sequences=False)
                → Dropout(0.2)
                → Dense(16, relu)
                → Dense(7, linear) ← 7-day prediction
    """
    model = Sequential([
        Input(shape=(WINDOW_SIZE, N_FEATURES)),
        LSTM(64, return_sequences=True, name='lstm_1'),
        Dropout(0.20, name='dropout_1'),
        LSTM(32, return_sequences=False, name='lstm_2'),
        Dropout(0.20, name='dropout_2'),
        Dense(16, activation='relu', name='dense_1'),
        Dense(PREDICT_DAYS, activation='linear', name='output')
    ])

    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mean_squared_error',
        metrics=['mae']
    )

    return model


# ─────────────────────────────────────────────────
# STEP 3: TRAIN LSTM
# ─────────────────────────────────────────────────

def train_lstm():
    """Full LSTM training pipeline."""

    print_section("AcademiCare — LSTM Training Pipeline")

    if not TF_AVAILABLE:
        print("\n  ⚠ TensorFlow not available. Cannot train LSTM.")
        print("  Install: pip install tensorflow")
        print("  Using fallback prediction for demo purposes.")
        return None

    # Generate sequences
    print_section("Step 1: Generating Time-Series Sequences")
    X, y = generate_lstm_sequences()

    # Train-test split
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    print(f"\n  Train: {X_train.shape[0]} sequences | Test: {X_test.shape[0]} sequences")

    # Build model
    print_section("Step 2: Building LSTM Model")
    model = build_lstm_model()
    model.summary()

    # Callbacks
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-5)
    ]

    # Train
    print_section("Step 3: Training LSTM")
    print(f"\n  Input:  ({WINDOW_SIZE} days × {N_FEATURES} features) per student")
    print(f"  Output: {PREDICT_DAYS}-day burnout score forecast\n")

    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.15,
        callbacks=callbacks,
        verbose=1
    )

    # Evaluate
    print_section("Step 4: Evaluation")
    test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)
    y_pred = model.predict(X_test, verbose=0)

    total_mae = np.mean(np.abs(y_pred - y_test))
    print(f"\n  Test Loss (MSE) : {test_loss:.4f}")
    print(f"  Test MAE        : {test_mae:.2f} burnout score points")
    print(f"  Total MAE       : {total_mae:.2f}")

    # Show sample predictions
    print(f"\n  Sample 7-Day Predictions:")
    print(f"  {'Day':>4}  {'Actual':>8}  {'Predicted':>10}  {'Error':>8}")
    print(f"  {'─'*38}")
    for day in range(PREDICT_DAYS):
        actual  = y_test[0, day]
        pred    = y_pred[0, day]
        error   = pred - actual
        print(f"  {day+1:>4}  {actual:>8.1f}  {pred:>10.1f}  {error:>+8.1f}")

    # Save model
    print_section("Step 5: Saving LSTM Model")
    os.makedirs('models', exist_ok=True)
    model.save(MODEL_PATH)
    print(f"  ✅ LSTM model saved → {MODEL_PATH}")

    # Save training history
    hist_path = 'models/lstm_history.json'
    with open(hist_path, 'w') as f:
        json.dump({
            'loss': [float(v) for v in history.history['loss']],
            'val_loss': [float(v) for v in history.history['val_loss']],
            'mae': [float(v) for v in history.history['mae']],
        }, f, indent=2)
    print(f"  ✅ Training history saved → {hist_path}")

    return model


# ─────────────────────────────────────────────────
# FALLBACK: NumPy LSTM Approximation (no TF needed)
# ─────────────────────────────────────────────────

def fallback_predict_7days(historical_scores: list) -> list:
    """
    NumPy-based trend extrapolation (used when TensorFlow unavailable).
    Fits a linear trend + Fourier component for realistic demo output.
    """
    scores = np.array(historical_scores[-14:])
    n = len(scores)
    t = np.arange(n)

    # Linear trend
    coeffs = np.polyfit(t, scores, 1)
    slope, intercept = coeffs

    # 7-day forecast
    future = []
    for i in range(1, PREDICT_DAYS + 1):
        pred = slope * (n + i) + intercept
        # Add oscillation + noise
        osc  = 3.0 * np.sin(2 * np.pi * (n + i) / 7.0)
        noise = np.random.normal(0, 1.5)
        pred = np.clip(pred + osc + noise, 0, 100)
        future.append(round(float(pred), 1))

    return future


# ─────────────────────────────────────────────────
# INFERENCE: Predict next 7 days for a student
# ─────────────────────────────────────────────────

def predict_stress_trajectory(historical_data: list) -> dict:
    """
    Predict 7-day stress trajectory from 14-day history.

    Args:
        historical_data: list of dicts, each with keys matching LSTM_FEATURES
                         e.g. [{'burnout_score':60, 'mood_score':5, ...}, ...]
                         Must have at least 14 entries.

    Returns:
        dict with predicted_scores, risk_trend, alert_days
    """
    if len(historical_data) < WINDOW_SIZE:
        raise ValueError(f"Need at least {WINDOW_SIZE} days of history, got {len(historical_data)}")

    # Use last 14 entries
    recent = historical_data[-WINDOW_SIZE:]
    scores = [d['burnout_score'] for d in recent]

    if TF_AVAILABLE and os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)

        # Build normalized input
        X = np.zeros((1, WINDOW_SIZE, N_FEATURES))
        for t, entry in enumerate(recent):
            X[0, t, 0] = entry['burnout_score'] / 100.0
            X[0, t, 1] = entry['mood_score'] / 10.0
            X[0, t, 2] = entry['sleep_hours'] / 12.0
            X[0, t, 3] = entry['study_hours'] / 16.0

        predicted = model.predict(X, verbose=0)[0].tolist()
        predicted = [round(np.clip(v, 0, 100), 1) for v in predicted]
        method = 'LSTM Neural Network (TensorFlow/Keras)'

    else:
        # Fallback
        predicted = fallback_predict_7days(scores)
        method = 'Trend Extrapolation (TF not installed)'

    # Risk analysis
    today = datetime.now()
    alert_days = []
    for i, score in enumerate(predicted):
        date = today + timedelta(days=i + 1)
        if score >= 75:
            alert_days.append({
                'day': i + 1,
                'date': date.strftime('%Y-%m-%d'),
                'score': score,
                'level': 'Critical'
            })
        elif score >= 55:
            alert_days.append({
                'day': i + 1,
                'date': date.strftime('%Y-%m-%d'),
                'score': score,
                'level': 'High'
            })

    # Overall trend
    if predicted[-1] > predicted[0] + 10:
        trend = 'worsening'
    elif predicted[-1] < predicted[0] - 10:
        trend = 'improving'
    else:
        trend = 'stable'

    return {
        'predicted_scores':  predicted,
        'prediction_method': method,
        'risk_trend':        trend,
        'max_predicted':     max(predicted),
        'alert_days':        alert_days,
        'window_used':       WINDOW_SIZE,
        'days_forecasted':   PREDICT_DAYS
    }


if __name__ == '__main__':
    import random
    random.seed(42)

    print_section("AcademiCare — LSTM Stress Predictor")

    # Train (or use fallback)
    model = train_lstm()

    # Demo inference
    print_section("Demo: 7-Day Stress Trajectory Prediction")

    # Simulate 14 days of data for Arjun Sharma
    demo_history = []
    base_burnout = 55.0
    for day in range(14):
        demo_history.append({
            'burnout_score': base_burnout + day * 0.8 + np.random.normal(0, 2),
            'mood_score':    max(1.0, 7.0 - day * 0.1 + np.random.normal(0, 0.3)),
            'sleep_hours':   max(3.0, 6.5 - day * 0.08 + np.random.normal(0, 0.2)),
            'study_hours':   min(12.0, 5.5 + day * 0.15 + np.random.normal(0, 0.3)),
        })

    result = predict_stress_trajectory(demo_history)

    print(f"\n  Method   : {result['prediction_method']}")
    print(f"  Trend    : {result['risk_trend'].upper()}")
    print(f"  Max Risk : {result['max_predicted']:.1f}/100")
    print(f"\n  7-Day Forecast:")
    today = datetime.now()
    for i, score in enumerate(result['predicted_scores']):
        date = (today + timedelta(days=i+1)).strftime('%b %d')
        risk = 'Critical' if score>=75 else 'High' if score>=55 else 'Moderate' if score>=30 else 'Low'
        bar = '█' * int(score / 5)
        print(f"  Day {i+1} ({date}): {bar:<20} {score:.1f}  [{risk}]")

    if result['alert_days']:
        print(f"\n  ⚠ Alert Days:")
        for ad in result['alert_days']:
            print(f"    Day {ad['day']} ({ad['date']}): Score {ad['score']} — {ad['level']} Risk")

    print(f"\n{'═'*60}")
    print(f"  ✅ LSTM Prediction Complete!")
    print(f"{'═'*60}\n")
