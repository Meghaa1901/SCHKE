import random
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

# The three named demo accounts — IDs and secure keys are stable so logins keep working.
core_patients = [
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

# ---- Generate 22 more realistic patients so the dashboard looks populated ----

_first_names = ["Maria", "David", "Priya", "James", "Aisha", "Robert", "Sofia", "Liam",
                "Chen", "Fatima", "Noah", "Elena", "Omar", "Grace", "Hassan", "Lucas",
                "Ananya", "Daniel", "Yuki", "Carlos", "Nadia", "Ethan"]
_last_names = ["Garcia", "Kim", "Patel", "Wilson", "Khan", "Brown", "Rossi", "Murphy",
               "Wang", "Ahmed", "Schmidt", "Petrov", "Hassan", "Lee", "Ali", "Costa",
               "Sharma", "Cohen", "Tanaka", "Mendez", "Haddad", "Clark"]
_blood = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
_condition_pool = ["Diabetes", "Hypertension", "Asthma", "High Cholesterol", "Acid Reflux",
                   "Osteoarthritis", "COPD", "Coronary Artery Disease", "Chronic Kidney Disease",
                   "Hypothyroidism", "Stroke"]
_med_pool = ["Metformin 500mg", "Amlodipine 5mg", "Atorvastatin 20mg", "Salbutamol inhaler",
             "Omeprazole 20mg", "Levothyroxine 50mcg", "Aspirin 75mg", "Losartan 50mg",
             "Ibuprofen 400mg PRN", "Insulin glargine"]

random.seed(42)  # fixed seed -> same demo data every time you re-seed

generated_patients = []
for i in range(22):
    pid = f"PAT-2{4000 + i}"  # PAT-24000 .. PAT-24021 (won't collide with random PAT-1xxxx registrations)
    name = f"{_first_names[i]} {_last_names[i]}"
    n_cond = random.randint(0, 2)
    n_med = random.randint(0, 3)
    generated_patients.append(
        Patient(
            id=pid,
            name=name,
            age=random.randint(19, 82),
            gender=random.choice(["Male", "Female"]),
            blood_type=random.choice(_blood),
            phone=f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            national_id_hash=f"sha-{random.randint(100, 999)}...",
            unique_id=str(random.randint(100000000000, 999999999999)),
            id_type="Aadhar",
            secure_key=f"SCKE-{random.randint(1000, 9999)}",
            medications=random.sample(_med_pool, n_med),
            conditions=random.sample(_condition_pool, n_cond),
        )
    )

patients = core_patients + generated_patients

# ---- Generate a spread of audit-log entries across all hospitals ----

now = datetime.now()
_actions = ["DATA_RETRIEVAL_EMERGENCY", "DATA_RETRIEVAL_ROUTINE", "CLINICAL_DOC_AI_ANALYSIS_SYNC"]
hospital_ids = [h.id for h in hospitals]
all_patient_ids = [p.id for p in patients]

logs = []
for i in range(40):
    hosp = random.choice(hospital_ids)
    pat = random.choice(all_patient_ids)
    action = random.choice(_actions)
    detail = "Vision AI processing complete" if action == "CLINICAL_DOC_AI_ANALYSIS_SYNC" \
        else f"Source: {random.choice(hospital_ids)}"
    logs.append(
        AccessLog(
            timestamp=(now - timedelta(hours=random.randint(1, 240))).isoformat(),
            hospital_id=hosp,
            action=action,
            patient_id=pat,
            details=detail,
        )
    )


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