from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Column, JSON
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


class Patient(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    age: int
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    national_id_hash: str
    unique_id: Optional[str] = None
    id_type: Optional[str] = None
    secure_key: Optional[str] = None
    medications: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    conditions: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    lab_results: list[dict] = Field(default_factory=list, sa_column=Column(JSON))

class PatientCreate(BaseModel):
    name: str
    age: int
    national_id: str
    id_type: str  # "Aadhar" or "Blockchain"

class PatientRead(BaseModel):
    id: str
    name: str
    age: int
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    unique_id: Optional[str] = None
    id_type: Optional[str] = None
    medications: list[str] = []
    conditions: list[str] = []
    lab_results: list[dict] = []


class RegisterResponse(BaseModel):
    id: str
    name: str
    secure_key: str

class PatientLogin(BaseModel):
    patient_id: str
    secure_key: str

class Prescription(SQLModel, table=True):
    id: str = Field(primary_key=True)
    patient_id: str
    hospital_id: str
    date: str
    raw_content: str
    ai_explanation: str
    extracted_terms: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    extracted_labs: list[dict] = Field(default_factory=list, sa_column=Column(JSON))

class AccessLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: str
    hospital_id: str
    action: str
    patient_id: str
    details: Optional[str] = None

class HospitalRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hospital_id: str
    patient_id: str
    term: str
    type: str  # "condition" or "allergy"

class RetrievalResult(BaseModel):
    patient_id: str
    conditions: list[str] = []
    allergies_confirmed: list[str] = []
    medications: list[str] = []
    confidence_score: float
    trace: list[str] = []

class RetrieveRequest(BaseModel):
    hospital_id: str
    patient_id: str