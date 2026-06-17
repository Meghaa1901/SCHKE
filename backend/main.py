import random
import string
import hashlib

from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import (
    Hospital, Patient, PatientCreate, PatientLogin, RetrieveRequest, AccessLog,
    PatientRead, RegisterResponse, RetrievalResult,
)
from retrieval import retrieve, ONTOLOGY, ontology_triples

app = FastAPI(title="SCKE API")


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


@app.get("/patients/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: str, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


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


@app.get("/ontology")
def get_ontology():
    return {
        "conditions": ONTOLOGY["conditions"],
        "allergies": ONTOLOGY["allergies"],
        "triples": ontology_triples(),
    }