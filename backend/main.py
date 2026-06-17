import random
import string
import hashlib

from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Hospital, Patient, PatientCreate, PatientLogin,RetrieveRequest
from retrieval import retrieve

app = FastAPI(title="SCKE API")


@app.get("/")
def health():
    return {"status": "ok", "service": "SCKE backend"}


@app.get("/hospitals")
def get_hospitals(session: Session = Depends(get_session)):
    hospitals = session.exec(select(Hospital)).all()
    return hospitals


@app.get("/patients/{patient_id}")
def get_patient(patient_id: str, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.post("/patients")
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

@app.get("/hospitals/{hospital_id}")
def get_hospital(hospital_id: str, session: Session = Depends(get_session)):
    hospital = session.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital


@app.post("/auth/patient")
def login_patient(data: PatientLogin, session: Session = Depends(get_session)):
    patient = session.get(Patient, data.patient_id)
    if not patient or patient.secure_key != data.secure_key:
        raise HTTPException(status_code=401, detail="Invalid patient ID or secure key")
    return patient

@app.post("/exchange/retrieve")
def exchange_retrieve(data: RetrieveRequest, session: Session = Depends(get_session)):
    return retrieve(session, data.hospital_id, data.patient_id)