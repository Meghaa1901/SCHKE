
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle, 
  Search, 
  Database,
  Lock,
  Layers,
  History,
  Zap
} from 'lucide-react';
import { aiDiagnosisService, DiseasePrediction, ModelMetrics, TrainingProgress } from '../services/aiDiagnosisService';
import { federatedService } from '../services/federatedService';
import TrainingSimulation from './TrainingSimulation';

const SYMPTOMS_OPTIONS = [
  'Chest Pain', 'Fatigue', 'Shortness of Breath', 'Headache', 
  'Joint Pain', 'Vision Blur', 'Persistent Cough', 'Weight Loss', 
  'Fever', 'Night Sweats', 'Abdominal Pain', 'Skin Changes'
];

const AIDiagnosisHub: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState<number>(45);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DiseasePrediction[] | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [training, setTraining] = useState<TrainingProgress[] | null>(null);

  useEffect(() => {
    // Load initial metrics
    setMetrics(aiDiagnosisService.getModelMetrics());
    setTraining(aiDiagnosisService.getTrainingProgress());
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);
    setResults(null);

    // Simulate federated processing delay
    setTimeout(async () => {
      const data = await aiDiagnosisService.predictDiseases(selectedSymptoms, age);
      setResults(data);
      setIsAnalyzing(false);
    }, 2000);
  };

  const validation = aiDiagnosisService.getValidationResults();
  const comparison = aiDiagnosisService.getComparisonData();
  const closeness = aiDiagnosisService.getPredictionCloseness();

  return (
    <div className="space-y-10 animate-fade-slide">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-2">
            AI DIAGNOSIS <span className="text-blue-500">HUB</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            Advanced Federated Intelligence System v4.2.0
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-400" />
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Security</div>
              <div className="text-xs font-bold text-white uppercase mt-1">Blockchain Hash-ID Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="p-10 rounded-[3rem] bg-slate-900 shadow-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <Brain size={120} className="text-blue-500" />
             </div>
             
             <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
               <Search size={22} className="text-blue-500" /> Clinical Selection
             </h3>

             <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 border-b border-white/5 pb-2">Select Present Symptoms</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SYMPTOMS_OPTIONS.map(symptom => {
                      const isSelected = selectedSymptoms.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {symptom}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Patient Age Analysis Factor: {age}</label>
                  <input 
                    type="range"
                    min="1"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || selectedSymptoms.length === 0}
                  className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                    isAnalyzing || selectedSymptoms.length === 0 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-500/20 active:scale-95'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Federated Query...
                    </>
                  ) : (
                    <>
                      <Zap size={16} /> Run Intelligent Diagnosis
                    </>
                  )}
                </button>
             </div>
          </div>

          {/* Model Stats */}
          <div className="p-8 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20">
            <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers size={16} /> Federated Network Insights
            </h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                 <span className="text-xs font-bold text-slate-400">Total Cases Analyzed</span>
                 <span className="text-sm font-black text-white">{validation.totalCases.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                 <span className="text-xs font-bold text-slate-400">Contributing Hubs</span>
                 <span className="text-sm font-black text-white">{federatedService.getNodes().length} Nodes Active</span>
               </div>
               <div className="flex justify-between items-center py-3">
                 <span className="text-xs font-bold text-slate-400">Semantic Matching</span>
                 <span className="text-sm font-black text-emerald-400">LOINC/SNOMED-CT Rooted</span>
               </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!results && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 rounded-[4rem] bg-white/5 border border-white/5 border-dashed"
              >
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-8">
                  <Brain size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-300 mb-4 tracking-tight">System Ready for Analysis</h3>
                <p className="text-slate-500 font-medium max-w-sm">Enter clinical symptoms to initiate a semantic cross-hospital knowledge exchange comparison.</p>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-10"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="text-blue-500 animate-pulse" size={40} />
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <p className="text-xl font-bold text-white tracking-tight">Aggregating Cross-Node Patterns...</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-blue-500"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-2xl font-black text-white">Top Predictive Outcomes</h3>
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                    High Reliability
                  </div>
                </div>

                <div className="space-y-4">
                  {results?.map((res, i) => (
                    <motion.div 
                      key={res.disease}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-5">
                           <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-blue-400">
                             {i + 1}
                           </div>
                           <div>
                             <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{res.disease}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detected across {res.patternNodes} nodes</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{res.casesAnalyzed.toLocaleString()} similar cases</span>
                             </div>
                           </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-white tracking-tighter">{res.confidence.toFixed(1)}%</div>
                          <div className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Confidence Score</div>
                        </div>
                      </div>

                      {/* Progress bar text-based representation */}
                      <div className="mb-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${res.confidence}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full ${res.confidence > 75 ? 'bg-blue-500' : res.confidence > 50 ? 'bg-indigo-500' : 'bg-slate-500'}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Supporting Factors</p>
                          <ul className="space-y-2">
                             {res.supportingFactors.map((f, idx) => (
                               <li key={idx} className="flex items-start gap-3 text-xs font-medium text-slate-300">
                                 <ShieldCheck size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                 {f}
                               </li>
                             ))}
                          </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                           <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-3">Clinical Recommendation</p>
                           <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                             "{res.recommendation}"
                           </p>
                        </div>
                      </div>
                    </motion.div>
                  )) || null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NEW: Epoch Training Visualization Section */}
      <TrainingSimulation />

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Model Metrics */}
         <div className="md:col-span-2 p-10 rounded-[3.5rem] bg-slate-900 border border-white/5 space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">System Evaluation Metrics</h3>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time validation</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { label: 'Accuracy', val: metrics?.accuracy, color: 'text-blue-500' },
                { label: 'Precision', val: metrics?.precision, color: 'text-indigo-500' },
                { label: 'Recall', val: metrics?.recall, color: 'text-emerald-500' },
                { label: 'F1 Score', val: metrics?.f1Score, color: 'text-purple-500' }
              ].map(m => (
                <div key={m.label} className="space-y-1">
                  <div className={`text-3xl font-black ${m.color} tracking-tighter`}>{m.val}%</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Confusion Matrix */}
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Confusion Matrix Output</p>
                  <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl border border-white/10">
                    <div className="bg-white/5 p-4"></div>
                    <div className="bg-white/5 p-4 text-[9px] font-black text-slate-400 uppercase text-center">Predicted Pos</div>
                    <div className="bg-white/5 p-4 text-[9px] font-black text-slate-400 uppercase text-center">Predicted Neg</div>
                    
                    <div className="bg-white/5 p-4 text-[9px] font-black text-slate-400 uppercase flex items-center">Actual Pos</div>
                    <div className="bg-emerald-500/10 p-6 text-center">
                      <div className="text-lg font-black text-emerald-400">TP = {metrics?.confusionMatrix.tp}</div>
                    </div>
                    <div className="bg-red-500/10 p-6 text-center">
                      <div className="text-lg font-black text-red-400">FN = {metrics?.confusionMatrix.fn}</div>
                    </div>

                    <div className="bg-white/5 p-4 text-[9px] font-black text-slate-400 uppercase flex items-center">Actual Neg</div>
                    <div className="bg-orange-500/10 p-6 text-center">
                      <div className="text-lg font-black text-orange-400">FP = {metrics?.confusionMatrix.fp}</div>
                    </div>
                    <div className="bg-slate-500/10 p-6 text-center">
                      <div className="text-lg font-black text-slate-300">TN = {metrics?.confusionMatrix.tn}</div>
                    </div>
                  </div>
               </div>

               {/* Global Consensus Status */}
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 border-b border-white/5 pb-2">Federated Consensus Distribution</p>
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">Active Nodes</span>
                        <span className="text-sm font-black text-blue-400">{federatedService.getNodes().length}/{federatedService.getNodes().length}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full" />
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">Sync Integrity</span>
                        <span className="text-sm font-black text-emerald-400">99.9%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99.9%]" />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Model Comparison */}
         <div className="p-10 rounded-[3.5rem] bg-indigo-600 shadow-2xl space-y-10 text-white">
            <h3 className="text-2xl font-black tracking-tight uppercase">Comparative Performance</h3>
            
            <div className="space-y-8">
              <div className="p-6 rounded-3xl bg-white/10 border border-white/10">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Current System Accuracy</div>
                <div className="text-4xl font-black">{comparison.currentModelAccuracy}%</div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500 w-fit px-3 py-1 rounded-lg">
                  <TrendingUp size={12} /> +{comparison.improvement.toFixed(2)}% Improvement
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-black/10 border border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Pretrained Baseline</div>
                <div className="text-2xl font-black">{comparison.pretrainedModelAccuracy}%</div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Metric Accuracy Breakdown</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold">Exact Match Rate</span>
                    <span className="text-lg font-black">{closeness.exactMatch}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${closeness.exactMatch}%` }} />
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xs font-bold">Partial Mapping</span>
                    <span className="text-lg font-black">{closeness.partialMatch}%</span>
                  </div>
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* Security Layer Notification */}
      <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm flex flex-col md:flex-row items-center gap-8 justify-between">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-blue-500">
               <Lock size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Blockchain-Backed Identity Layer</h4>
              <p className="text-slate-500 font-medium text-sm mt-1">Cross-hospital access logs are stored on an immutable ledger using SHA-256 hash-based authentication.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Traditional Fallback Active
            </div>
            <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              HIPAA Compliant
            </div>
         </div>
      </div>
    </div>
  );
};

export default AIDiagnosisHub;
