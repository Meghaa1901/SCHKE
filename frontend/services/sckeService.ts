import { Patient, RetrievalResult, AccessLog, Prescription, Hospital, RDFTriple } from '../types';
import { 
  ONTOLOGY_CONDITIONS, 
  ONTOLOGY_ALLERGIES, 
  MOCK_HOSPITAL_DATA, 
  MOCK_CLINICAL_NOTES 
} from '../constants';

const API_BASE = "http://localhost:8000";

// Minimal in-memory RDF Graph for Semantic Reasoning
class RDFGraph {
  triples: RDFTriple[] = [];

  add(subject: string, predicate: string, object: string) {
    if (!this.triples.find(t => t.subject === subject && t.predicate === predicate && t.object === object)) {
      this.triples.push({ subject, predicate, object });
    }
  }

  match(s?: string, p?: string, o?: string): RDFTriple[] {
    return this.triples.filter(t => 
      (!s || t.subject === s) && 
      (!p || t.predicate === p) && 
      (!o || t.object === o)
    );
  }
}

class SCKEService {
  private patients: Patient[] = [
    { 
      id: 'PAT-123456', 
      name: 'John Doe', 
      age: 45,
      gender: 'Male',
      blood_type: 'A+',
      phone: '+1 (555) 019-2834',
      national_id_hash: 'sha-77a...',
      unique_id: '123456789012',
      id_type: 'Aadhar',
      secure_key: 'SCKE-JD92',
      password: 'password123', 
      medications: [], 
      conditions: ['Diabetes'] 
    },
    { 
      id: 'PAT-888999', 
      name: 'Jane Smith', 
      age: 32,
      gender: 'Female',
      blood_type: 'B-',
      phone: '+1 (555) 837-1122',
      national_id_hash: 'sha-33c...',
      unique_id: '0x888b6...',
      id_type: 'Blockchain',
      secure_key: 'SCKE-JS21',
      password: 'password123', 
      medications: ['Aspirin'], 
      conditions: ['Stroke'] 
    },
    // DEMO PATIENT FOR REVIEWERS
    { 
      id: 'PAT-DEMO', 
      name: 'Alex Rivera', 
      age: 41,
      gender: 'Male',
      blood_type: 'O+',
      phone: '+1 (555) 999-0000',
      national_id_hash: 'sha-demo-99',
      unique_id: '999988887777',
      id_type: 'Aadhar',
      secure_key: 'DEMO-123',
      password: 'demo', 
      medications: ['Lisinopril 10mg', 'Atorvastatin 20mg', 'Omeprazole 40mg', 'Ibuprofen 400mg PRN'],
      conditions: ['Hypertension'],
      blood_test_reports: [
        {
          reportId: 'BTR-001',
          testType: 'CBC',
          hemoglobin: 14.2,
          whiteBloodCells: 7500,
          platelets: 250000,
          glucose: 95,
          sodium: 140,
          potassium: 4.2,
          liverEnzymes: 25,
          kidneyMarkers: 0.9,
          reportDate: '2025-05-15',
          validityStatus: 'expired'
        },
        {
          reportId: 'BTR-002',
          testType: 'Metabolic Panel',
          hemoglobin: 14.5,
          whiteBloodCells: 7200,
          platelets: 245000,
          glucose: 92,
          sodium: 138,
          potassium: 4.0,
          liverEnzymes: 22,
          kidneyMarkers: 0.85,
          reportDate: '2026-02-10',
          validityStatus: 'valid'
        }
      ]
    },
  ];

  private hospitals: Hospital[] = [
    { id: 'HOSP-01', name: 'General Medical Center', style: 'Formal/ICD', managedBy: 'GMC Hospital Board' },
    { id: 'HOSP-02', name: 'Community Wellness Clinic', style: 'Informal', managedBy: 'Wellness Health Group' },
    { id: 'HOSP-03', name: 'City Urgent Care', style: 'Abbreviations', managedBy: 'City Health Authority' },
    { id: 'HOSP-04', name: 'St. Mary\'s Specialized Hospital', style: 'Formal/ICD', managedBy: 'St. Mary\'s Healthcare System' },
    { id: 'HOSP-05', name: 'Riverside Pediatric Center', style: 'Informal', managedBy: 'Riverside Health Trust' },
    { id: 'HOSP-DEMO', name: 'Metropolis General (Reviewer Node)', style: 'Hybrid', managedBy: 'Metropolis Health Administration' },
  ];

  private prescriptions: Prescription[] = [];
  private logs: AccessLog[] = [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), hospital_id: 'HOSP-01', action: 'DATA_RETRIEVAL_EMERGENCY', patient_id: 'PAT-123456', details: 'Source: HOSP-02, HOSP-03' },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), hospital_id: 'HOSP-02', action: 'CLINICAL_DOC_AI_ANALYSIS_SYNC', patient_id: 'PAT-888999', details: 'Vision AI processing complete' },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), hospital_id: 'HOSP-03', action: 'DATA_RETRIEVAL_ROUTINE', patient_id: 'PAT-DEMO', details: 'Source: HOSP-01' },
    { timestamp: new Date(Date.now() - 172800000).toISOString(), hospital_id: 'HOSP-01', action: 'FEDERATED_MODEL_UPDATE', patient_id: 'SYSTEM', details: 'Local weights contributed to global model v1.4' },
  ];

  async registerPatient(name: string, age: number, unique_id: string, id_type: 'Aadhar' | 'Blockchain'): Promise<Patient> {
    // Saves the new patient in the FastAPI backend / database.
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, national_id: unique_id, id_type }),
    });
    if (!res.ok) {
      throw new Error('Registration failed');
    }
    const data = await res.json(); // { id, name, secure_key }
    return {
      id: data.id,
      name: data.name,
      age,
      national_id_hash: '',
      unique_id,
      id_type,
      secure_key: data.secure_key,
      medications: [],
      conditions: [],
    };
  }

  async validatePatient(patId: string, secure_key: string): Promise<Patient | undefined> {
    // Checks credentials against the FastAPI backend.
    const res = await fetch(`${API_BASE}/auth/patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patId, secure_key }),
    });
    if (!res.ok) {
      return undefined; // 401 = wrong ID or key
    }
    return await res.json();
  }

  registerHospital(name: string, style: string, managedBy?: string): Hospital {
    const id = `HOSP-${Math.floor(10 + Math.random() * 89)}`;
    const newHospital: Hospital = { id, name, style, managedBy: managedBy || 'Hospital Administration' };
    this.hospitals.push(newHospital);
    return newHospital;
  }

  getHospitals(): Hospital[] {
    return this.hospitals;
  }

  getHospital(id: string): Hospital | undefined {
    return this.hospitals.find(h => h.id === id);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    // Fetch a patient from the FastAPI backend.
    const res = await fetch(`${API_BASE}/patients/${id}`);
    if (!res.ok) {
      return undefined; // 404 = no such patient
    }
    return await res.json();
  }

  getPrescriptions(patient_id: string): Prescription[] {
    return this.prescriptions.filter(p => p.patient_id === patient_id);
  }

  getAccessLogs(patient_id: string): AccessLog[] {
    return this.logs.filter(l => l.patient_id === patient_id);
  }

  async getHospitalLogs(hospital_id: string): Promise<AccessLog[]> {
    // Fetch all audit logs from the backend, then keep the ones relevant to this hospital.
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) {
      return [];
    }
    const logs: AccessLog[] = await res.json();
    return logs.filter(l => l.hospital_id === hospital_id || (l.details ? l.details.includes(hospital_id) : false));
  }

  // Expose the core ontology as an RDF Graph for UI visualization
  getOntologyRDF(): RDFTriple[] {
    const graph = new RDFGraph();
    Object.entries(ONTOLOGY_CONDITIONS).forEach(([syn, can]) => {
      const synNode = `snomed:${syn.replace(/\s+/g, '_').toLowerCase()}`;
      const canNode = `snomed:${can.replace(/\s+/g, '_').toLowerCase()}`;
      graph.add(synNode, 'owl:sameAs', canNode);
      graph.add(canNode, 'rdfs:label', `"${can}"`);
    });
    return graph.triples;
  }

  async processPrescription(source_id: string, patient_id: string, base64Image: string): Promise<Prescription> {
    // Sends the image to the FastAPI backend, which runs Gemini vision server-side,
    // normalizes the findings through the ontology, and saves everything to the database.
    const res = await fetch(`${API_BASE}/prescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hospital_id: source_id,
        patient_id,
        image_base64: base64Image,
      }),
    });
    if (!res.ok) {
      throw new Error('Prescription analysis failed');
    }
    return await res.json();
  }

  async aiAssistant(symptoms: string, patient_id?: string): Promise<any> {
    // Calls the real Gemini-powered assistant on the FastAPI backend.
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, patient_id: patient_id || null }),
    });
    if (!res.ok) {
      throw new Error('AI assistant request failed');
    }
    return await res.json();
  }

  async hospitalRetrieve(hospital_id: string, patient_id: string): Promise<RetrievalResult> {
    // Calls the real FastAPI backend instead of doing the work in the browser.
    const res = await fetch(`${API_BASE}/exchange/retrieve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospital_id, patient_id }),
    });
    if (!res.ok) {
      throw new Error('Retrieval failed');
    }
    return await res.json();
  }
}

export const scke = new SCKEService();