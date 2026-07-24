# 🎓 AcademiCare — Cloud Analytics Platform for Student Burnout Detection & Prevention

AcademiCare is an enterprise-grade, ML-powered Web Application designed to proactively monitor student mental health, predict burnout risks, and provide actionable wellness insights for educational institutions.

---

## ✨ Features & Key Highlights

- **🤖 Multi-Model Machine Learning Pipeline**: 
  - **Random Forest Classifier**: Predicts burnout risk levels (`Low`, `Moderate`, `High`, `Critical`).
  - **Random Forest Regressor**: Computes continuous burnout severity scores (`0–100`).
  - **K-Means Clustering**: Groups students into anonymized peer support/study networks.
  - **Exam Stress Regressor**: Anticipates exam-related stress spikes based on academic deadlines.
- **🔐 Enterprise Security & Production Hardening**:
  - **bcrypt Password Hashing**: Built-in SHA-256 pre-hashing layer for password hashing.
  - **JWT Authentication**: 30-minute state-less access tokens with auto-expiry handling.
  - **Brute-Force Lockout Guard**: 5 failed login attempts trigger an automatic 15-minute lockout (HTTP 429).
  - **Role-Based Access Control (RBAC)**: Role partitioning for `Student`, `Counselor`, `Admin`, and `Faculty`.
  - **Pydantic v2 Real-Time Backend Validation**: Field-level numeric range checks, RFC email regex, password complexity, and string sanitization.
  - **Security Headers & CORS**: Custom HTTP security middleware (`X-Content-Type-Options`, `X-Frame-Options`, strict CORS rules).
- **📊 Real-Time Interactive Dashboard**:
  - Dynamic visual charts, daily check-in forms with real-time feedback.
  - Interactive sliders, password strength meters, inline validation, and notes character counters.
  - Automated counselor alerts for critical risk cases with deduplication (`1 alert per student per day`).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+ SPA architecture), Vanilla CSS (Custom Design System, Dark Mode, Glassmorphism).
- **Backend API**: Python FastAPI, Uvicorn, Pydantic v2.
- **Security & Auth**: `bcrypt`, `python-jose` (JWT), HTTP Bearer middleware.
- **Machine Learning & Data Science**: Scikit-Learn, NumPy, Pandas, Joblib.
- **Database**: SQLite (Local Dev / WAL mode enabled) / PostgreSQL (Production DDL included in `/database/schema.sql`).

---

## 📁 Repository Structure

```text
academicaire/
├── simple_server.py       # Production-hardened FastAPI server & REST API
├── train_all_models.py    # Training script for Random Forest & K-Means models
├── run_ml_pipeline.py     # Standalone pipeline runner & validation test
├── check_models.py        # Model inspection utility
├── requirements.txt       # Python dependencies
├── index.html             # Main Single Page Application HTML
├── css/                   # Global CSS tokens, glassmorphism & responsive layouts
├── js/
│   ├── app.js             # Client router, JWT auth & global app controller
│   ├── validation.js      # Real-time frontend validation engine
│   ├── pages.js           # Dynamic page template renderer
│   ├── charts.js          # Chart.js visualization wrappers
│   └── data.js            # Mock dataset & state utilities
├── database/
│   └── schema.sql         # PostgreSQL production DDL with CHECK & UNIQUE constraints
├── models/                # Trained Scikit-Learn model artifacts (.pkl)
└── ml/                    # Feature engineering & dataset generators
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.9+ installed
- Git

### 2. Installation

Clone the repository and navigate into the directory:
```bash
git clone https://github.com/YOUR_USERNAME/academicare.git
cd academicare
```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

### 3. Running the Server

Start the FastAPI application:
```bash
python simple_server.py
```

The application will start locally at:
- 🌐 **Web App**: [http://localhost:8000](http://localhost:8000)
- 📜 **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔐 Demo Credentials

| Role | Email Address | Password |
|---|---|---|
| **Student** | `arjun.sharma@christuniversity.in` | `Demo@1234` |
| **Student** | `priya.krishnan@christuniversity.in` | `Demo@1234` |
| **Counselor** | `counselor@christuniversity.in` | `Counselor@2026` |

*Note: You can also register a new account through the `/register` page.*

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/students` | Register a new student account | Public |
| `POST` | `/api/login` | Authenticate user & issue JWT token | Public |
| `GET` | `/api/me` | Fetch active user profile from JWT token | Authenticated |
| `POST` | `/api/checkin` | Submit daily wellness check-in & trigger ML inference | Student |
| `GET` | `/api/dashboard/{id}` | Fetch dashboard metrics & recommendations | Student |
| `GET` | `/api/history/{id}` | Retrieve 30-day historical burnout trends | Student |
| `GET` | `/api/history/{id}/sufficiency` | Check dataset sufficiency for advanced ML models | Student |
| `GET` | `/api/counselor/alerts` | Fetch active high-risk student alerts | Counselor / Admin |
| `POST` | `/api/counselor/alerts/{token}/resolve` | Resolve an anonymous counselor alert | Counselor / Admin |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
