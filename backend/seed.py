from datetime import datetime, timedelta
from sqlmodel import Session, select
from database import engine
from models import Hospital, Patient, AccessLog

hospitals = [
    Hospital(id="HOSP-01", name="General Medical Center", style="Formal/ICD", managedBy="GMC Hospital Board"),
    Hospital(id="HOSP-02", name="Community Wellness Clinic", style="Informal", managedBy="Wellness Health Group"),
    Hospital(id="HOSP-03", name="City Urgent Care", style="Abbreviations", managedBy="City Health Authority"),
    Hospital(id="HOSP-04", name="St. Mary's Specialized Hospital", style="Formal/ICD", managedBy="St. Mary's Healthcare System"),
    Hospital(id="HOSP-05", name="Riverside Pediatric Center", style="Informal", managedBy="Riverside Health Trust"),
    Hospital(id="HOSP-DEMO", name="Metropolis General (Reviewer Node)", style="Hybrid", managedBy="Metropolis Health Administration"),
]

patients = [
    Patient(id="PAT-123456", name="John Doe", age=45, gender="Male", blood_type="A+",
            phone="+1 (555) 019-2834", national_id_hash="sha-77a...", unique_id="123456789012",
            id_type="Aadhar", secure_key="SCKE-JD92", medications=[], conditions=["Diabetes"]),
    Patient(id="PAT-888999", name="Jane Smith", age=32, gender="Female", blood_type="B-",
            phone="+1 (555) 837-1122", national_id_hash="sha-33c...", unique_id="0x888b6...",
            id_type="Blockchain", secure_key="SCKE-JS21", medications=["Aspirin"], conditions=["Stroke"]),
    Patient(id="PAT-DEMO", name="Alex Rivera", age=41, gender="Male", blood_type="O+",
            phone="+1 (555) 999-0000", national_id_hash="sha-demo-99", unique_id="999988887777",
            id_type="Aadhar", secure_key="DEMO-123",
            medications=["Lisinopril 10mg", "Atorvastatin 20mg", "Omeprazole 40mg", "Ibuprofen 400mg PRN"],
            conditions=["Hypertension"]),
]

now = datetime.now()
logs = [
    AccessLog(timestamp=(now - timedelta(hours=1)).isoformat(), hospital_id="HOSP-01",
              action="DATA_RETRIEVAL_EMERGENCY", patient_id="PAT-123456", details="Source: HOSP-02, HOSP-03"),
    AccessLog(timestamp=(now - timedelta(hours=2)).isoformat(), hospital_id="HOSP-02",
              action="CLINICAL_DOC_AI_ANALYSIS_SYNC", patient_id="PAT-888999", details="Vision AI processing complete"),
    AccessLog(timestamp=(now - timedelta(days=1)).isoformat(), hospital_id="HOSP-03",
              action="DATA_RETRIEVAL_ROUTINE", patient_id="PAT-DEMO", details="Source: HOSP-01"),
   
]


def seed():
    with Session(engine) as session:
        # Clear old rows first, so you can safely re-run this without duplicates
        for row in session.exec(select(Hospital)).all():
            session.delete(row)
        for row in session.exec(select(Patient)).all():
            session.delete(row)
        for row in session.exec(select(AccessLog)).all():
            session.delete(row)
        session.commit()

        # Add the fresh data
        session.add_all(hospitals)
        session.add_all(patients)
        session.add_all(logs)
        session.commit()

    print(f"Seeded {len(hospitals)} hospitals, {len(patients)} patients, {len(logs)} logs.")


if __name__ == "__main__":
    seed()