import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from models import ClinicalAssessment, PrescriptionExtraction

load_dotenv()  # read backend/.env
API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None


def clinical_assistant(symptoms: str, patient_context: str = "") -> ClinicalAssessment:
    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to backend/.env")

    prompt = f"""You are a clinical decision-support assistant for doctors.
Patient context: {patient_context or "none provided"}
Reported symptoms: {symptoms}

Give a brief summary, a list of possible conditions each with short reasoning,
suggested next steps (tests or referrals), and a clear disclaimer that this is
decision support only and not a diagnosis."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ClinicalAssessment,
        ),
    )
    return ClinicalAssessment(**json.loads(response.text))


def extract_prescription(image_bytes: bytes, mime_type: str) -> PrescriptionExtraction:
    """Send a prescription / lab-report image to Gemini and get back structured data."""
    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to backend/.env")

    prompt = """You are a clinical document analysis assistant. The attached image is a
medical prescription or lab report. Read it carefully and extract:

1. conditions: diagnosed conditions, written as formal medical terms.
2. medications: prescribed medications, including dosage when it is visible.
3. lab_results: any lab tests found, each with test_name, value, unit,
   reference_range (if shown), and status (normal / abnormal / critical).
4. explanation: a short, plain-English summary a patient could understand.

If a section has nothing in the image, return an empty list for it.
Do not invent or guess data that is not clearly present."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PrescriptionExtraction,
        ),
    )
    return PrescriptionExtraction(**json.loads(response.text))