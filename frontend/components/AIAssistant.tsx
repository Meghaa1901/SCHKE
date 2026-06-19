import React, { useState } from 'react';
import { scke } from '../services/sckeService';

interface PossibleCondition {
  name: string;
  reasoning: string;
}

interface ClinicalAssessment {
  summary: string;
  possible_conditions: PossibleCondition[];
  suggested_next_steps: string[];
  disclaimer: string;
}

const AIAssistant: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [patientId, setPatientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClinicalAssessment | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await scke.aiAssistant(symptoms, patientId || undefined);
      setResult(data);
    } catch (err) {
      setError('The AI assistant could not be reached. Make sure the backend is running and the Gemini key is set in .env.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">AI Clinical Assistant</h2>
        <p className="text-slate-400 font-medium">
          Enter symptoms to get an AI-generated, decision-support assessment. This is not a diagnosis.
        </p>
      </div>

      {/* Input */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-6">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Reported Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. frequent thirst, blurry vision, fatigue"
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium h-28 resize-none"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Patient ID (optional — adds their record as context)
          </label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value.toUpperCase())}
            placeholder="PAT-DEMO"
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !symptoms.trim()}
          className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-4"
        >
          {isLoading ? (
            <><i className="fas fa-spinner fa-spin text-xl"></i> Analyzing...</>
          ) : (
            <><i className="fas fa-brain text-xl"></i> Analyze Symptoms</>
          )}
        </button>
        {error && (
          <p className="text-rose-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[2.5rem]">
            <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-3">Summary</p>
            <p className="text-slate-200 font-medium leading-relaxed">{result.summary}</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-4">
              <i className="fas fa-notes-medical text-blue-400"></i> Possible Conditions
            </h3>
            <div className="space-y-5">
              {result.possible_conditions.map((c, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5">
                  <p className="text-base font-black text-white mb-2">{c.name}</p>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{c.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-4">
              <i className="fas fa-list-check text-emerald-400"></i> Suggested Next Steps
            </h3>
            <ul className="space-y-3">
              {result.suggested_next_steps.map((s, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-300 font-medium">
                  <i className="fas fa-circle-check text-emerald-400 mt-1"></i>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-start gap-4">
            <i className="fas fa-triangle-exclamation text-amber-400 text-lg mt-0.5"></i>
            <p className="text-[11px] font-bold text-amber-300/90 leading-relaxed">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;