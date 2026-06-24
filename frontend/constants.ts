
import { Mapping } from './types';

export const ONTOLOGY_CONDITIONS: Mapping = {
  // Diabetes
  'diabetes mellitus': 'Diabetes',
  'sugar disease': 'Diabetes',
  't2d': 'Diabetes',
  'a1c': 'Diabetes',
  'diabetes': 'Diabetes',
  
  // Hypertension
  'htn': 'Hypertension',
  'high blood pressure': 'Hypertension',
  'hypertension': 'Hypertension',
  
  // Stroke
  'stroke': 'Stroke',
  'tia': 'Stroke',
  'cerebral infarction': 'Stroke',
  'neuro': 'Stroke',

  // CAD
  'cad': 'Coronary Artery Disease',
  'heart attack': 'Coronary Artery Disease',
  'mi': 'Coronary Artery Disease',
  'cardio': 'Coronary Artery Disease',

  // CKD
  'ckd': 'Chronic Kidney Disease',
  'kidney failure': 'Chronic Kidney Disease',

  // Respiratory
  'asthma': 'Asthma',
  'copd': 'COPD',

  // NEW: Additional terms for Demo
  'hyperlipidemia': 'High Cholesterol',
  'hld': 'High Cholesterol',
  'high cholesterol': 'High Cholesterol',
  
  'gerd': 'Acid Reflux',
  'acid reflux': 'Acid Reflux',
  'heartburn': 'Acid Reflux',
  
  'hypothyroidism': 'Hypothyroidism',
  'underactive thyroid': 'Hypothyroidism',
  
  'oa': 'Osteoarthritis',
  'arthritis': 'Osteoarthritis',
};

export const ONTOLOGY_ALLERGIES: Mapping = {
  'penicillin': 'Penicillin Allergy',
  'pcn': 'Penicillin Allergy',
  'sulfa': 'Sulfa Allergy',
  'shellfish': 'Shellfish Allergy',
  'peanuts': 'Peanut Allergy',
  'latex': 'Latex Allergy',
};

export const HOSPITALS = [
  { id: 'HOSP-01', name: 'General Medical Center', style: 'Formal/ICD', managedBy: 'GMC Hospital Board' },
  { id: 'HOSP-02', name: 'Community Wellness Clinic', style: 'Informal', managedBy: 'Wellness Health Group' },
  { id: 'HOSP-03', name: 'City Urgent Care', style: 'Abbreviations', managedBy: 'City Health Authority' },
  { id: 'HOSP-04', name: 'St. Mary\'s Specialized Hospital', style: 'Formal/ICD', managedBy: 'St. Mary\'s Healthcare System' },
  { id: 'HOSP-05', name: 'Riverside Pediatric Center', style: 'Informal', managedBy: 'Riverside Health Trust' },
  { id: 'HOSP-DEMO', name: 'Metropolis General (Reviewer Node)', style: 'Hybrid', managedBy: 'Metropolis Health Administration' },
];
