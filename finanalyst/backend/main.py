import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models.db_models import init_db
from routers import upload, analysis, reports

load_dotenv()

app = FastAPI(title="FinAnalyst API", version="1.0.0")

# Allow localhost for dev + any configured frontend origin for production
allowed_origins = ["http://localhost:3000"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(reports.router)


@app.on_event("startup")
def startup():
    init_db()
    # Auto-train model if not present (first deploy)
    model_path = os.getenv("MODEL_PATH", "./ml/model.pkl")
    if not os.path.exists(model_path):
        try:
            import subprocess, sys
            subprocess.run([sys.executable, "ml/train.py"], check=True)
        except Exception as e:
            print(f"Warning: could not train model on startup: {e}")


@app.get("/health")
def health():
    return {"status": "ok"}
