import random
import string
import hashlib
import base64
import re
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import (
    Hospital, Patient, PatientCreate, PatientLogin, RetrieveRequest, AccessLog,
    PatientRead, RegisterResponse, RetrievalResult, AssistantRequest, ClinicalAssessment,
    Prescription, PrescriptionRequest,
)
from retrieval import retrieve, ONTOLOGY, ontology_triples
from ai import clinical_assistant, extract_prescription

app = FastAPI(title="SCKE API")
import os

# Local dev origins always allowed; production frontend URL comes from an env var.
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "service": "SCKE backend"}


@app.get("/hospitals", response_model=list[Hospital])
def get_hospitals(session: Session = Depends(get_session)):
    return session.exec(select(Hospital)).all()


@app.get("/hospitals/{hospital_id}", response_model=Hospital)
def get_hospital(hospital_id: str, session: Session = Depends(get_session)):
    hospital = session.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    hospital_count = len(session.exec(select(Hospital)).all())
    patient_count = len(session.exec(select(Patient)).all())
    # Each ontology synonym is one semantic mapping (condition + allergy synonyms)
    mapping_count = len(ONTOLOGY["conditions"]) + len(ONTOLOGY["allergies"])
    # Records extracted per hospital, from the real audit log
    logs = session.exec(select(AccessLog)).all()
    per_hospital = {}
    for log in logs:
        per_hospital[log.hospital_id] = per_hospital.get(log.hospital_id, 0) + 1
    return {
        "hospitals": hospital_count,
        "patients": patient_count,
        "semantic_mappings": mapping_count,
        "records_per_hospital": per_hospital,
    }

@app.get("/patients/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: str, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/patients", response_model=list[PatientRead])
def list_patients(session: Session = Depends(get_session)):
    return session.exec(select(Patient)).all()


@app.post("/patients", response_model=RegisterResponse)
def register_patient(data: PatientCreate, session: Session = Depends(get_session)):
    new_id = f"PAT-{random.randint(10000, 99999)}"
    secure_key = "SCKE-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    national_id_hash = "sha256-" + hashlib.sha256(data.national_id.encode()).hexdigest()[:12]

    patient = Patient(
        id=new_id,
        name=data.name,
        age=data.age,
        national_id_hash=national_id_hash,
        unique_id=data.national_id,
        id_type=data.id_type,
        secure_key=secure_key,
        medications=[],
        conditions=[],
    )
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient


@app.post("/auth/patient", response_model=PatientRead)
def login_patient(data: PatientLogin, session: Session = Depends(get_session)):
    patient = session.get(Patient, data.patient_id)
    if not patient or patient.secure_key != data.secure_key:
        raise HTTPException(status_code=401, detail="Invalid patient ID or secure key")
    return patient


@app.post("/exchange/retrieve", response_model=RetrievalResult)
def exchange_retrieve(data: RetrieveRequest, session: Session = Depends(get_session)):
    return retrieve(session, data.hospital_id, data.patient_id)


@app.get("/logs", response_model=list[AccessLog])
def get_logs(session: Session = Depends(get_session)):
    logs = session.exec(select(AccessLog)).all()
    return sorted(logs, key=lambda log: log.timestamp, reverse=True)

@app.get("/patients/{patient_id}/prescriptions", response_model=list[Prescription])
def get_patient_prescriptions(patient_id: str, session: Session = Depends(get_session)):
    rows = session.exec(
        select(Prescription).where(Prescription.patient_id == patient_id)
    ).all()
    return sorted(rows, key=lambda rx: rx.date)


@app.get("/ontology")
def get_ontology():
    return {
        "conditions": ONTOLOGY["conditions"],
        "allergies": ONTOLOGY["allergies"],
        "triples": ontology_triples(),
    }

@app.post("/ai/assistant", response_model=ClinicalAssessment)
def ai_assistant(data: AssistantRequest, session: Session = Depends(get_session)):
    context = ""
    if data.patient_id:
        patient = session.get(Patient, data.patient_id)
        if patient:
            context = f"Age {patient.age}; known conditions: {patient.conditions}; current medications: {patient.medications}"
    try:
        return clinical_assistant(data.symptoms, context)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")


# ---- helpers for the prescription endpoint ----

def _decode_data_url(data_url: str):
    """Turn the browser's 'data:image/png;base64,xxxx' string into raw bytes + mime type."""
    match = re.match(r"^data:(?P<mime>.*?);base64,(?P<data>.*)$", data_url, re.DOTALL)
    if match:
        return base64.b64decode(match.group("data")), match.group("mime")
    # No prefix? Assume it's already raw base64 of a JPEG.
    return base64.b64decode(data_url), "image/jpeg"


def _merge(existing, new):
    """Add new items to a list without duplicates, keeping order."""
    out = list(existing or [])
    for item in new:
        if item not in out:
            out.append(item)
    return out


@app.post("/prescription", response_model=Prescription)
def process_prescription(data: PrescriptionRequest, session: Session = Depends(get_session)):
    patient = session.get(Patient, data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 1. Decode the uploaded image and send it to Gemini vision.
    try:
        image_bytes, mime_type = _decode_data_url(data.image_base64)
        extraction = extract_prescription(image_bytes, mime_type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI extraction failed: {e}")

    # 2. Normalize conditions through the same ontology the retrieval engine uses
    #    (e.g. "diabetes mellitus" -> "Diabetes"). Unknown terms are kept as-is.
    normalized_conditions = [
        ONTOLOGY["conditions"].get(c.strip().lower(), c) for c in extraction.conditions
    ]

    new_labs = [lab.model_dump() for lab in extraction.lab_results]

    # 3. Merge findings into the patient's central profile and save.
    patient.conditions = _merge(patient.conditions, normalized_conditions)
    patient.medications = _merge(patient.medications, extraction.medications)
    if new_labs:
        patient.lab_results = (patient.lab_results or []) + new_labs
    session.add(patient)

    # 4. Save the prescription record itself.
    rx = Prescription(
        id=f"RX-{random.randint(10000, 99999)}",
        patient_id=data.patient_id,
        hospital_id=data.hospital_id,
        date=datetime.now().isoformat(),
        raw_content=extraction.model_dump_json(),
        ai_explanation=extraction.explanation,
        extracted_terms=normalized_conditions + list(extraction.medications),
        extracted_labs=new_labs,
    )
    session.add(rx)

    # 5. Write an audit log entry, like the other endpoints do.
    session.add(AccessLog(
        timestamp=datetime.now().isoformat(),
        hospital_id=data.hospital_id,
        action="CLINICAL_DOC_AI_ANALYSIS_SYNC",
        patient_id=data.patient_id,
        details="Vision AI extracted clinical markers from an uploaded document",
    ))

    session.commit()
    session.refresh(rx)
    return rx