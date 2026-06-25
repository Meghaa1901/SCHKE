# SCKE — Semantic Cross-Hospital Knowledge Exchange

A full-stack healthcare interoperability platform that unifies a patient's
records scattered across different hospitals, normalizes inconsistent medical
terminology into shared concepts, and adds two real AI-powered features on top.

**🔗 Live demo:** https://schke.vercel.app
**⚙️ API:** https://schke.onrender.com

> Note: the backend runs on a free tier and sleeps after inactivity, so the
> first request after an idle period may take ~40 seconds to wake up.

## Demo login
The app has a Hospital portal and a Patient portal.

- **Patient portal** — Patient ID `PAT-DEMO`, Secure Key `DEMO-123`
- **Hospital portal** — pick any hospital (e.g. General Medical Center) to enter

## What it does
- **Semantic normalization:** maps inconsistent medical terms (e.g. "HTN",
  "high blood pressure", "sugar disease") to a single canonical concept using
  an RDF / ontology reasoning layer with `owl:sameAs` inference.
- **Cross-hospital retrieval:** unifies a patient's records scattered across
  multiple hospital nodes into one summary, with an audit log of every access.
- **AI clinical assistant:** sends a patient's normalized record + symptoms to
  an LLM and returns a structured, plain-English assessment (decision support,
  not a diagnosis).
- **AI prescription extraction:** upload a prescription or lab-report image and
  Gemini Vision extracts the conditions, medications, and lab values
  server-side, normalizes them through the ontology, and saves them to the
  patient's record.

## Architecture
- **Frontend** (React + Vite) deployed on Vercel calls the **backend** (FastAPI)
  deployed on Render over a REST API.
- The Gemini API key lives **only on the backend** — the browser never sees it.
- All data (patients, hospitals, records, audit logs) is persisted in the
  backend database; the frontend holds no source-of-truth data.

## Tech stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite (via SQLModel)
- **AI:** Google Gemini (text + vision)
- **Hosting:** Vercel (frontend) + Render (backend)

## Running locally
**Backend**
```bash
cd backend
pip install -r requirements.txt
# create a .env file with: GEMINI_API_KEY=your_key_here
uvicorn main:app --reload
```
The backend creates and seeds its database automatically on startup.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
The frontend defaults to `http://localhost:8000` for the API when run locally.
