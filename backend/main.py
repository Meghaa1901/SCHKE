from fastapi import FastAPI

app = FastAPI(title="SCKE API")

@app.get("/")
def health():
    return {"status": "ok", "service": "SCKE backend"}