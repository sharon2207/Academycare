# ================================================================
# AcademiCare — FastAPI Backend
# Cloud Analytics Platform for Student Burnout Detection
#
# Architecture:
#   React PWA → FastAPI (AWS EC2) → PostgreSQL (AWS RDS)
#                                 → ML Engine (.pkl models)
#                                 → Firebase FCM (Alerts)
#                                 → AWS S3 (Reports)
# ================================================================

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from backend.routers import auth, checkin, analytics, ml_engine, counselor, reports
from backend.database import engine, Base

# ── Create all tables on startup ─────────────────────────────
Base.metadata.create_all(bind=engine)

# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="AcademiCare API",
    description="""
    ## AcademiCare — Cloud Analytics Platform for Student Burnout Detection

    ### Architecture
    - **Frontend**: React.js PWA (connects to this API)
    - **Backend**: FastAPI on AWS EC2
    - **Database**: PostgreSQL on AWS RDS
    - **ML Engine**: Scikit-learn (Random Forest, K-Means, Regression)
    - **Alerts**: Firebase Cloud Messaging (FCM)
    - **Storage**: AWS S3 (reports, exports)

    ### SDG Alignment
    - 🌍 SDG 3: Good Health & Well-Being
    - 📚 SDG 4: Quality Education
    """,
    version="1.0.0",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc"
)

# ── CORS — allow React frontend to call this API ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # In production: ["https://your-domain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register all routers ──────────────────────────────────────
app.include_router(auth.router,      prefix="/api/v1/auth",      tags=["Authentication"])
app.include_router(checkin.router,   prefix="/api/v1/checkin",   tags=["Daily Check-In"])
app.include_router(ml_engine.router, prefix="/api/v1/ml",        tags=["ML Engine"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(counselor.router, prefix="/api/v1/counselor", tags=["Counselor Alerts"])
app.include_router(reports.router,   prefix="/api/v1/reports",   tags=["Reports & S3"])


# ── Root health check ─────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "AcademiCare API",
        "version": "1.0.0",
        "status": "running",
        "cloud": "AWS EC2",
        "database": "PostgreSQL on AWS RDS",
        "ml_models": ["RandomForest", "LSTM", "KMeans", "Regression", "PearsonCorr"],
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "timestamp": __import__("datetime").datetime.utcnow().isoformat()}


# ── Run locally (same code deploys to EC2) ───────────────────
if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True          # Auto-reload on code changes (dev mode)
    )
