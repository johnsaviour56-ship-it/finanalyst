# FinAnalyst – Financial Statement Analysis Platform

## Quick Start

### 1. Start the database
```bash
docker-compose up db -d
```

### 2. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt

# Train the ML model (one-time)
cd ml && python train.py && cd ..

# Start the API
uvicorn main:app --reload --port 8000
```

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/` | Upload PDF/Excel/CSV |
| POST | `/api/analysis/` | Manual data entry + analyze |
| GET | `/api/analysis/history/{company}` | Multi-year history |
| GET | `/api/reports/{company}/{year}` | Download PDF report |
| GET | `/health` | Health check |

---

## Profitability Scoring (0–100)

| Metric | Max Points | Thresholds |
|--------|-----------|------------|
| Net Profit Margin | 20 | ≥15%=20, ≥5%=10 |
| ROA | 15 | ≥10%=15, ≥5%=8 |
| ROE | 15 | ≥15%=15, ≥8%=8 |
| Current Ratio | 15 | ≥2=15, ≥1=8 |
| Debt-to-Equity | 15 | <1=15, <2=8 |
| Asset Turnover | 10 | ≥1=10, ≥0.5=5 |
| Positive Op. CF | 10 | positive=10 |

- **65–100** → Profitable
- **35–64** → Moderate
- **0–34** → High Risk

---

## Docker (Full Stack)
```bash
docker-compose up --build
```

---

## Future Improvements
- User authentication (JWT)
- Multi-company comparison dashboard
- Industry benchmarking
- LLM-generated narrative reports
- Time-series forecasting (Prophet/LSTM)
- Audit trail and data versioning
