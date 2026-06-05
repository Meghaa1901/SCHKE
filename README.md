# SCKE — Semantic Cross-Hospital Knowledge Exchange

A full-stack healthcare interoperability system that normalizes fragmented
medical terminology across hospitals and adds an AI-powered clinical summary layer.

## What it does
- **Semantic normalization:** maps inconsistent medical terms (e.g. "HTN",
  "high blood pressure", "htn") to a single canonical concept using an
  RDF/ontology reasoning layer.
- **AI clinical assistant:** sends a patient's normalized record + symptoms to
  an LLM and returns a structured, plain-English assessment (decision support,
  not a diagnosis).
- **Cross-hospital retrieval:** unifies a patient's records scattered across
  multiple hospital nodes into one summary, with an audit log of every access.

## Tech stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind
- **Backend:** FastAPI (Python)
- **Database:** SQLite (via SQLModel)
- **AI:** Google Gemini

## Note
The federated-learning dashboard is a **conceptual simulation** included to
illustrate future scope — it does not perform live model training.

## Status
🚧 Backend migration in progress (moving logic from client-side TypeScript to FastAPI).
