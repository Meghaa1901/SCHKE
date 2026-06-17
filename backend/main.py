from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from database import get_session
from models import Hospital

app = FastAPI(title="SCKE API")


@app.get("/")
def health():
    return {"status": "ok", "service": "SCKE backend"}


@app.get("/hospitals")
def get_hospitals(session: Session = Depends(get_session)):
    hospitals = session.exec(select(Hospital)).all()
    return hospitals