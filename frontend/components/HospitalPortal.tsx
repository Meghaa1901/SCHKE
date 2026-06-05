
import React, { useState } from 'react';
import { scke } from '../services/sckeService';
import { federatedService, DiagnosticPrediction } from '../services/federatedService';
import { RetrievalResult, Prescription, Patient } from '../types';
import OntologyMap from './OntologyMap';

interface HospitalPortalProps {
  hospitalId: string;
}

const HospitalPortal: React.FC<HospitalPortalProps> = ({ hospitalId }) => {
  const [patientSearchId, setPatientSearchId] = useState('');
  const [retrievalResult, setRetrievalResult] = useState<RetrievalResult | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [latestPrescription, setLatestPrescription] = useState<Prescription | null>(null);
  const [activeView, setActiveView] = useState<'search' | 'ontology'>('search');
  
  // Federated AI state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [aiPredictions, setAiPredictions] = useState<DiagnosticPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const availableSymptoms = [
    'chest pain', 'fatigue', 'shortness of breath', 'headache', 'joint pain', 'vision blur',
    'persistent cough', 'unexplained weight loss', 'lump/swelling', 'night sweats', 'fever', 'abdominal pain', 'skin change'
  ];

  const handleRetrieve = async () => {
    if (!patientSearchId.startsWith('PAT-')) return alert('Valid PAT-ID required');
    setIsProcessing(true);
    setActiveView('search'); 
    setAiPredictions([]);
    setSelectedSymptoms([]);
    try {
      const result = await scke.hospitalRetrieve(hospitalId, patientSearchId);
      const data = scke.getPatient(patientSearchId);
      setRetrievalResult(result);
      setPatientData(data || null);
      // Show audit log confirmation
      console.log(`Audit log created for ${hospitalId} accessing ${patientSearchId}`);
    } catch (err) {
      alert('Network retrieval failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunFederatedAI = async () => {
    if (!patientData) return;
    setIsAnalyzing(true);
    try {
      // Extract medications from the latest prescription if available, or from patient data
      const meds = latestPrescription ? latestPrescription.extracted_terms : (patientData.medications || []);
      const results = await federatedService.predictDiagnosis(selectedSymptoms, patientData.age, meds);
      setAiPredictions(results);
    } catch (err) {
      console.error("Federated AI Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!patientSearchId) return alert('Enter Patient ID first.');

    const reader = new FileReader();
    reader.onload = async () => {
      setIsUploading(true);
      try {
        const result = await scke.processPrescription(hospitalId, patientSearchId, reader.result as string);
        setLatestPrescription(result);
        handleRetrieve();
      } catch (err: any) {
        console.error("Upload Error in Hospital Portal:", err);
        alert(`AI processing failed: ${err.message || 'Please check the console for details.'}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Controls (Light Clean Theme) */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
          
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
            <i className="fas fa-search text-blue-500"></i> Global Retrieval
          </h3>
          <div className="space-y-4 relative z-10">
            <input 
              type="text" 
              value={patientSearchId}
              onChange={(e) => setPatientSearchId(e.target.value.toUpperCase())}
              placeholder="PAT-ID"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-sm font-black uppercase tracking-widest placeholder-slate-400 transition-all"
            />
            <button 
              onClick={handleRetrieve}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 hover:-translate-y-1 transition-all duration-300"
            >
              {isProcessing ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : 'Query Semantic Layer'}
            </button>
          </div>
        </div>

        {/* Ontology Graph Explorer Toggle */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3 relative z-10">
            <i className="fas fa-project-diagram text-purple-500"></i> Ontology Engine
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 leading-relaxed relative z-10">
            Inspect the underlying Semantic Web structures and RDF Triples powering the Knowledge Exchange.
          </p>
          <button 
            onClick={() => setActiveView(activeView === 'ontology' ? 'search' : 'ontology')}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 relative z-10 border ${
              activeView === 'ontology' 
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200' 
                : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 hover:border-purple-300'
            }`}
          >
            {activeView === 'ontology' ? 'Return to Search' : 'View RDF Graph'}
          </button>
        </div>

        {retrievalResult && activeView === 'search' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
              <i className="fas fa-camera-retro text-emerald-500"></i> Clinical Scan
            </h3>
            <input type="file" accept="image/*" onChange={handleFileUpload} id="rx-upload" className="hidden" disabled={isUploading}/>
            <label htmlFor="rx-upload" className="w-full border-2 border-dashed border-slate-300 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-emerald-400 transition-all group">
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-pulse">Running Vision AI...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 group-hover:text-emerald-500 transition-all shadow-sm border border-slate-200">
                    <i className="fas fa-cloud-upload-alt text-2xl"></i>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600">Upload Document</p>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-8">
        {activeView === 'ontology' ? (
          <OntologyMap />
        ) : !retrievalResult ? (
          <div className="bg-white h-[500px] rounded-[3rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-10 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0,transparent_50%)]"></div>
            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 mb-6 shadow-inner border border-slate-200">
              <i className="fas fa-network-wired text-4xl"></i>
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">System standby. Enter PAT-ID to initiate semantic data fusion.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-10 pb-6 border-b border-slate-100 relative z-10 gap-6">
                
                {/* Patient Demographics Header */}
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200 text-blue-600 shrink-0 shadow-inner">
                    <i className="fas fa-user text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{patientData?.name || patientSearchId}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200">ID: {patientSearchId}</span>
                      {patientData?.age && <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200">Age: {patientData.age}</span>}
                      {patientData?.gender && <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200">{patientData.gender}</span>}
                      {patientData?.blood_type && <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-rose-200"><i className="fas fa-tint mr-1"></i> {patientData.blood_type}</span>}
                      {patientData?.phone && <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200"><i className="fas fa-phone mr-1"></i> {patientData.phone}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <i className="fas fa-shield-check"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Secure Audit Log Created</p>
                  <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-tight">Access by {hospitalId} recorded in patient's immutable ledger.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-project-diagram text-indigo-500"></i> Unified Ontology Nodes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {retrievalResult.conditions.map((c, i) => (
                      <span key={i} className="px-3 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-default shadow-sm">
                        {c}
                      </span>
                    ))}
                    {retrievalResult.allergies_confirmed.map((a, i) => (
                      <span key={`a-${i}`} className="px-3 py-2 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors cursor-default shadow-sm">
                        {a} <i className="fas fa-exclamation-triangle ml-1 opacity-50"></i>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-capsules text-blue-500"></i> Cross-Verified Meds
                  </h4>
                  <div className="space-y-2">
                    {retrievalResult.medications.length > 0 ? retrievalResult.medications.map((m, i) => (
                      <div key={i} className="px-4 py-3 bg-white shadow-sm rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 text-slate-700 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {m}
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 font-medium italic">No medications found in active records.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Federated AI Diagnostic Section */}
              <div className="mt-10 pt-10 border-t border-slate-100 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                    <i className="fas fa-brain text-indigo-500"></i> Federated AI Diagnostic Engine
                  </h3>
                  <button 
                    onClick={handleRunFederatedAI}
                    disabled={isAnalyzing || selectedSymptoms.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : 'Run Global Inference'}
                  </button>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Observed Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {availableSymptoms.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          selectedSymptoms.includes(s) 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {aiPredictions.length > 0 && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                    {aiPredictions.map((p, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.condition}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Based on {p.basedOnCases.toLocaleString()} similar cases</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-black ${p.confidence > 0.8 ? 'text-emerald-500' : p.confidence > 0.6 ? 'text-indigo-500' : 'text-slate-400'}`}>
                              {(p.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {p.supportingFactors.map((f, j) => (
                            <div key={j} className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                              <i className="fas fa-check-circle text-emerald-500 text-[8px]"></i> {f}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                          <p className="text-[10px] font-bold text-indigo-700 leading-relaxed italic">
                            <i className="fas fa-info-circle mr-1"></i> {p.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {latestPrescription && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <i className="fas fa-robot"></i> Intelligent Agent Analysis
                </h3>
                <div className="bg-white p-6 rounded-2xl border border-blue-100/50 shadow-sm mb-6">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{latestPrescription.ai_explanation}"</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {latestPrescription.extracted_terms.map((term, i) => (
                    <span key={i} className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-sm">{term}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalPortal;
