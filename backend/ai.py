import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from models import ClinicalAssessment

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