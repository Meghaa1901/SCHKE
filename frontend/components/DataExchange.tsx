
import React, { useState, useEffect } from 'react';
import { scke } from '../services/sckeService';
import { RetrievalResult, Hospital } from '../types';

interface DataExchangeProps {
  hospitalId?: string;
}

const DataExchange: React.FC<DataExchangeProps> = ({ hospitalId: initialHospitalId }) => {
  const [patientId, setPatientId] = useState('');
  const [hospitalId, setHospitalId] = useState(initialHospitalId || '');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RetrievalResult | null>(null);

  useEffect(() => {
    const list = scke.getHospitals();
    setHospitals(list);
    if (!initialHospitalId && list.length > 0) setHospitalId(list[0].id);
  }, [initialHospitalId]);

  const handleRetrieve = async () => {
    if (!patientId.startsWith('PAT-')) return alert('Please enter a valid PAT-ID');
    setIsProcessing(true);
    setResult(null);
    
    // Simulate network latency
    setTimeout(async () => {
      const data = await scke.hospitalRetrieve(hospitalId, patientId);
      setResult(data);
      setIsProcessing(false);
      // Show audit log confirmation
      console.log(`Audit log created for ${hospitalId} accessing ${patientId}`);
    }, 1500);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">SCKE Data Exchange</h2>
          <p className="text-slate-400 font-medium mt-2">Initiate cross-hospital multi-agent semantic retrieval.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Audit Logging Active</span>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col md:flex-row gap-8 items-end">
        <div className="flex-1 space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Patient (Universal PAT-ID)</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value.toUpperCase())}
            placeholder="PAT-XXXXX"
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
          />
        </div>
        <div className="flex-1 space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Requesting Hospital</label>
          <select
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium appearance-none cursor-pointer"
          >
            {hospitals.map(h => <option key={h.id} value={h.id} className="bg-slate-900">{h.name} ({h.id})</option>)}
          </select>
        </div>
        <button
          disabled={isProcessing}
          onClick={handleRetrieve}
          className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-4"
        >
          {isProcessing ? (
            <><i className="fas fa-spinner fa-spin text-xl"></i> Processing...</>
          ) : (
            <><i className="fas fa-search text-xl"></i> Retrieve Unified Data</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Agent Activity Trace */}
        <div className="bg-slate-950 text-emerald-400 p-10 rounded-[3.5rem] font-mono text-xs shadow-2xl min-h-[500px] border border-white/5">
          <div className="flex items-center gap-4 mb-8 text-[11px] font-black uppercase text-slate-500 border-b border-white/5 pb-6 tracking-widest">
            <i className="fas fa-terminal text-emerald-500"></i> Agent Layer Activity Trace
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-6 custom-scrollbar">
            {result ? result.trace.map((t, i) => (
              <div key={i} className="animate-in slide-in-from-left duration-300 flex gap-4" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span> 
                <span className="leading-relaxed">{t}</span>
              </div>
            )) : (
              <div className="text-slate-600 italic">Waiting for request...</div>
            )}
            {isProcessing && <div className="animate-pulse text-emerald-500">_</div>}
          </div>
        </div>

        {/* Unified Semantic Result */}
        <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl min-h-[500px]">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
            <i className="fas fa-file-medical text-blue-400"></i> Unified Patient Summary
          </h3>
          
          {!result ? (
            <div className="h-[350px] flex flex-col items-center justify-center text-slate-700 space-y-6">
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-4xl border border-white/5">
                <i className="fas fa-database"></i>
              </div>
              <p className="text-xs font-black uppercase tracking-widest">No data retrieved yet</p>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-blue-500/10 p-8 rounded-[2.5rem] border border-blue-500/20">
                <div>
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-2">Confidence Score</p>
                  <p className="text-4xl font-black text-white">{(result.confidence_score * 100).toFixed(0)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-3">Status</p>
                  <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] rounded-full font-black uppercase tracking-widest">Verified Match</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-5 shadow-2xl animate-in zoom-in duration-500">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
                  <i className="fas fa-shield-check text-xl"></i>
                </div>
                <div>
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Audit Log Created</p>
                  <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-tight">
                    Access recorded in global ledger.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-5">Normalized Conditions</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.conditions.length > 0 ? result.conditions.map((c, i) => (
                      <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-white uppercase tracking-wider">
                        {c}
                      </span>
                    )) : <p className="text-xs text-slate-600 italic">No conditions found.</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-5">Confirmed Allergies</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.allergies_confirmed.length > 0 ? result.allergies_confirmed.map((a, i) => (
                      <span key={i} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        {a}
                      </span>
                    )) : <p className="text-xs text-slate-600 italic">No allergies found.</p>}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex gap-6">
                <button 
                  onClick={() => alert(`CDA Document for ${patientId} exported successfully.`)}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Export CDA
                </button>
                <button 
                  onClick={() => alert(`Data for ${patientId} synchronized to ${hospitalId} EMR.`)}
                  className="flex-1 py-5 bg-white/5 text-white border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Sync to EMR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExchange;
