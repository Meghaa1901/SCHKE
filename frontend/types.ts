
// Add missing Mapping type for medical term normalization
export type Mapping = Record<string, string>;

export interface Hospital {
  id: string;
  name: string;
  style: string;
  managedBy?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender?: string;
  blood_type?: string;
  phone?: string;
  national_id_hash: string;
  unique_id?: string;
  id_type?: 'Aadhar' | 'Blockchain';
  secure_key?: string;
  password?: string; // Simple simulated password
  medications: string[];
  conditions: string[]; // Persistent list of identified conditions
  lab_results?: LabResult[];
  blood_test_reports?: BloodTestReport[];
}

export interface BloodTestReport {
  reportId: string;
  testType: "CBC" | "Metabolic Panel";
  hemoglobin: number;
  whiteBloodCells: number;
  platelets: number;
  glucose: number;
  sodium: number;
  potassium: number;
  liverEnzymes: number;
  kidneyMarkers: number;
  reportDate: string;
  validityStatus: "valid" | "expired";
}

export interface LabResult {
  test_name: string;
  value: string;
  unit: string;
  reference_range?: string;
  date: string;
  status?: 'normal' | 'abnormal' | 'critical';
}

export interface Prescription {
  id: string;
  patient_id: string;
  hospital_id: string;
  date: string;
  raw_content: string;
  ai_explanation: string;
  extracted_terms: string[];
  extracted_labs?: LabResult[];
}

export interface RetrievalResult {
  patient_id: string;
  conditions: string[];
  allergies_confirmed: string[];
  medications: string[];
  confidence_score: number;
  trace: string[];
}

export interface AccessLog {
  timestamp: string;
  hospital_id: string;
  action: string;
  patient_id: string;
  details?: string;
}

export interface RDFTriple {
  subject: string;
  predicate: string;
  object: string;
}

export type PortalType = 'NONE' | 'HOSPITAL' | 'PATIENT';
