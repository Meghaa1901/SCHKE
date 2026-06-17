from pydantic import BaseModel
from sqlmodel import SQLModel, Field
from typing import Optional


class LabResult(BaseModel):
    test_name: str
    value: str
    unit: str
    reference_range: Optional[str] = None
    date: str
    status: Optional[str] = None  # "normal" | "abnormal" | "critical"


class Hospital(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    style: Optional[str] = None
    managedBy: Optional[str] = None


class Patient(BaseModel):
    id: str
    name: str
    age: int
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    national_id_hash: str
    unique_id: Optional[str] = None
    id_type: Optional[str] = None  # "Aadhar" | "Blockchain"
    secure_key: Optional[str] = None
    medications: list[str] = []
    conditions: list[str] = []
    lab_results: list[LabResult] = []


class Prescription(BaseModel):
    id: str
    patient_id: str
    hospital_id: str
    date: str
    raw_content: str
    ai_explanation: str
    extracted_terms: list[str] = []
    extracted_labs: list[LabResult] = []


class AccessLog(BaseModel):
    timestamp: str
    hospital_id: str
    action: str
    patient_id: str
    details: Optional[str] = None


class RetrievalResult(BaseModel):
    patient_id: str
    conditions: list[str] = []
    allergies_confirmed: list[str] = []
    medications: list[str] = []
    confidence_score: float
    trace: list[str] = []