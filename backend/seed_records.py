import json
from pathlib import Path
from sqlmodel import Session, select
from database import engine
from models import HospitalRecord

DATA_FILE = Path(__file__).parent / "hospital_records.json"


def seed_records():
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    with Session(engine) as session:
        # clear old records first so re-running is safe
        for row in session.exec(select(HospitalRecord)).all():
            session.delete(row)
        session.commit()
        session.add_all([HospitalRecord(**r) for r in records])
        session.commit()
    print(f"Seeded {len(records)} hospital records.")


if __name__ == "__main__":
    seed_records()