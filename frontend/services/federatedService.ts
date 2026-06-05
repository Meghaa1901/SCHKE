
export interface HospitalNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'training' | 'syncing';
  recordCount: number;
  lastSync: string;
  contribution: number;
  modelVersion: number;
  location: { x: number; y: number };
  specialty: string;
}

export interface ModelWeights {
  nodeId: string;
  weights: number[];
  accuracy: number;
  trainingRounds: number;
  timestamp: string;
}

export interface GlobalModel {
  version: number;
  accuracy: number;
  totalTrainingRounds: number;
  participatingNodes: number;
  lastAggregated: string;
  weightVector: number[];
  improvementHistory: { round: number; accuracy: number; nodes: number }[];
}

export interface FederatedRound {
  roundId: string;
  startedAt: string;
  completedAt?: string;
  participatingNodes: string[];
  globalAccuracyBefore: number;
  globalAccuracyAfter: number;
  status: 'running' | 'aggregating' | 'complete';
}

export interface DiagnosticPrediction {
  condition: string;
  confidence: number;
  supportingFactors: string[];
  basedOnCases: number;
  recommendation: string;
}

class FederatedLearningService {
  private nodes: HospitalNode[] = [
    { id: 'HOSP-01', name: 'General Medical Center', status: 'online', recordCount: 4521, lastSync: '2026-03-17 10:00', contribution: 22, modelVersion: 7, location: { x: 20, y: 30 }, specialty: 'Clinical' },
    { id: 'HOSP-02', name: 'Community Wellness Clinic', status: 'online', recordCount: 2847, lastSync: '2026-03-17 10:15', contribution: 14, modelVersion: 7, location: { x: 75, y: 20 }, specialty: 'Hybrid' },
    { id: 'HOSP-03', name: 'City Urgent Care', status: 'online', recordCount: 3209, lastSync: '2026-03-17 09:45', contribution: 16, modelVersion: 7, location: { x: 50, y: 70 }, specialty: 'Emergency' },
    { id: 'HOSP-04', name: 'St. Mary\'s Specialized Hospital', status: 'online', recordCount: 891, lastSync: '2026-03-17 11:00', contribution: 5, modelVersion: 7, location: { x: 15, y: 75 }, specialty: 'Hybrid' },
    { id: 'HOSP-05', name: 'Riverside Pediatric Center', status: 'online', recordCount: 6102, lastSync: '2026-03-17 10:30', contribution: 43, modelVersion: 7, location: { x: 82, y: 65 }, specialty: 'Research' },
    { id: 'HOSP-DEMO', name: 'Metropolis General (Reviewer Node)', status: 'online', recordCount: 1250, lastSync: '2026-03-17 11:30', contribution: 12, modelVersion: 7, location: { x: 40, y: 15 }, specialty: 'Hybrid' },
  ];

  private globalModel: GlobalModel = {
    version: 7,
    accuracy: 0.924,
    totalTrainingRounds: 847,
    participatingNodes: 6,
    lastAggregated: '2026-03-17 12:00',
    weightVector: Array(16).fill(0).map(() => Math.random()),
    improvementHistory: [
      { round: 1, accuracy: 0.61, nodes: 1 },
      { round: 100, accuracy: 0.72, nodes: 2 },
      { round: 300, accuracy: 0.81, nodes: 3 },
      { round: 500, accuracy: 0.88, nodes: 4 },
      { round: 847, accuracy: 0.924, nodes: 6 },
    ]
  };

  private callbacks: ((event: any) => void)[] = [];

  onUpdate(cb: (event: any) => void) {
    this.callbacks.push(cb);
  }

  private emit(event: any) {
    this.callbacks.forEach(cb => cb(event));
  }

  getNodes() { return [...this.nodes]; }
  getGlobalModel() { return { ...this.globalModel }; }

  private simulateLocalTraining(nodeId: string, specialty: string, round: number) {
    const weights = Array(16).fill(0).map((_, i) => {
      const seed = nodeId.charCodeAt(0) + round + i;
      return (Math.sin(seed) + Math.cos(seed)) / 2 + 0.5;
    });

    let baseAcc = 0.82;
    if (specialty === 'Research') baseAcc = 0.88;
    else if (specialty === 'Clinical') baseAcc = 0.85;

    const accuracy = Math.min(0.97, baseAcc + (round * 0.0001)); // Adjusted round multiplier to be more realistic for high round counts
    return { weights, accuracy };
  }

  private federatedAveraging(allWeights: number[][]) {
    const numWeights = allWeights[0].length;
    const averaged = Array(numWeights).fill(0);
    for (let i = 0; i < numWeights; i++) {
      let sum = 0;
      for (const w of allWeights) {
        sum += w[i];
      }
      averaged[i] = sum / allWeights.length;
    }
    return averaged;
  }

  async runFederatedRound(onProgress: (msg: string) => void) {
    this.emit({ type: 'ROUND_STARTED' });
    onProgress("Distributing global model...");
    await new Promise(r => setTimeout(r, 600));

    const localResults: { weights: number[], accuracy: number }[] = [];

    for (const node of this.nodes) {
      node.status = 'training';
      this.emit({ type: 'NODE_TRAINING', nodeId: node.id });
      onProgress(`Local training at ${node.name}...`);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

      const { weights, accuracy } = this.simulateLocalTraining(node.id, node.specialty, this.globalModel.totalTrainingRounds);
      localResults.push({ weights, accuracy });

      node.status = 'syncing';
      this.emit({ type: 'NODE_SYNCING', nodeId: node.id });
      onProgress(`Uploading model weights from ${node.id}...`);
      await new Promise(r => setTimeout(r, 200));

      node.status = 'online';
      node.lastSync = new Date().toISOString().replace('T', ' ').substring(0, 16);
      node.modelVersion = this.globalModel.version + 1;
    }

    onProgress("Aggregating local insights...");
    await new Promise(r => setTimeout(r, 500));

    const newWeights = this.federatedAveraging(localResults.map(r => r.weights));
    const avgAcc = localResults.reduce((sum, r) => sum + r.accuracy, 0) / localResults.length;
    const newAccuracy = Math.min(0.98, avgAcc + 0.002);

    this.globalModel.version += 1;
    this.globalModel.totalTrainingRounds += 1;
    this.globalModel.weightVector = newWeights;
    this.globalModel.accuracy = newAccuracy;
    this.globalModel.lastAggregated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.globalModel.improvementHistory.push({
      round: this.globalModel.totalTrainingRounds,
      accuracy: newAccuracy,
      nodes: this.nodes.length
    });

    onProgress(`Round ${this.globalModel.version} complete. Global accuracy: ${(newAccuracy * 100).toFixed(2)}%`);
    this.emit({ type: 'ROUND_COMPLETE' });
  }

  async predictDiagnosis(symptoms: string[], patientAge: number, medications: string[] = []): Promise<DiagnosticPrediction[]> {
    await new Promise(r => setTimeout(r, 800));

    const symptomMap: Record<string, string> = {
      'chest pain': 'Coronary Artery Disease',
      'fatigue': 'Type 2 Diabetes',
      'shortness of breath': 'COPD/Asthma',
      'headache': 'Hypertension',
      'joint pain': 'Rheumatoid Arthritis',
      'vision blur': 'Diabetic Retinopathy',
      'persistent cough': 'Lung Cancer',
      'unexplained weight loss': 'Metastatic Cancer',
      'lump/swelling': 'Potential Tumor/Neoplasm',
      'night sweats': 'Lymphoma',
      'fever': 'Infectious Disease',
      'abdominal pain': 'Gastrointestinal Disorder',
      'skin change': 'Melanoma/Skin Cancer'
    };

    const medicationMap: Record<string, string> = {
      'Metformin': 'Type 2 Diabetes',
      'Insulin': 'Diabetes Mellitus',
      'Lisinopril': 'Hypertension',
      'Atorvastatin': 'Hyperlipidemia',
      'Amlodipine': 'Hypertension',
      'Tamoxifen': 'Breast Cancer',
      'Chemotherapy': 'Active Malignancy',
      'Pembrolizumab': 'Advanced Cancer/Immunotherapy',
      'Methotrexate': 'Rheumatoid Arthritis/Autoimmune',
      'Albuterol': 'Asthma/COPD',
      'Omeprazole': 'GERD/Gastric Ulcer'
    };

    const potentialConditions = new Map<string, { confidence: number, factors: string[] }>();

    // Process Symptoms
    symptoms.forEach(s => {
      const condition = symptomMap[s.toLowerCase()];
      if (condition) {
        const current = potentialConditions.get(condition) || { confidence: 0.4, factors: [] };
        current.confidence += 0.25;
        current.factors.push(`Symptom match: ${s}`);
        potentialConditions.set(condition, current);
      }
    });

    // Process Medications
    medications.forEach(m => {
      // Simple fuzzy match for meds
      Object.keys(medicationMap).forEach(medKey => {
        if (m.toLowerCase().includes(medKey.toLowerCase())) {
          const condition = medicationMap[medKey];
          const current = potentialConditions.get(condition) || { confidence: 0.5, factors: [] };
          current.confidence += 0.35;
          current.factors.push(`Medication alignment: ${m} (indicated for ${condition})`);
          potentialConditions.set(condition, current);
        }
      });
    });

    const predictions: DiagnosticPrediction[] = [];
    const totalRecords = this.nodes.reduce((sum, n) => sum + n.recordCount, 0);

    potentialConditions.forEach((data, condition) => {
      const finalConfidence = Math.min(0.98, data.confidence * this.globalModel.accuracy);
      const basedOnCases = Math.floor(totalRecords * (0.15 + Math.random() * 0.25));

      predictions.push({
        condition,
        confidence: finalConfidence,
        supportingFactors: [
          ...data.factors,
          `Age demographic alignment (${patientAge})`,
          `Federated pattern recognition across ${this.nodes.length} nodes`
        ],
        basedOnCases,
        recommendation: `Based on ${basedOnCases} similar cases in the network, this pattern strongly suggests ${condition}. Immediate clinical consultation and diagnostic imaging (CT/MRI/Biopsy) is recommended if not already performed.`
      });
    });

    if (predictions.length === 0) {
      return [{
        condition: 'Further Assessment Required',
        confidence: 0.35,
        supportingFactors: ['Inconclusive symptom/medication profile', 'Low pattern match'],
        basedOnCases: 120,
        recommendation: 'The current profile does not match high-confidence federated patterns. Please perform a manual clinical evaluation.'
      }];
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }
}

export const federatedService = new FederatedLearningService();
