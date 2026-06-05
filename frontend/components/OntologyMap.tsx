
import React, { useState } from 'react';
import { 
  Layers, 
  Network, 
  HeartPulse, 
  Zap, 
  Database, 
  Wand2 
} from 'lucide-react';
import { scke } from '../services/sckeService';
import { ONTOLOGY_CONDITIONS, ONTOLOGY_ALLERGIES } from '../constants';
import { Mapping } from '../types';

const OntologyMap: React.FC = () => {
  const [viewMode, setViewMode] = useState<'visual' | 'rdf'>('visual');

  // Visual grouping logic
  const allMappings: Mapping = { ...ONTOLOGY_CONDITIONS, ...ONTOLOGY_ALLERGIES };
  const grouped: Record<string, string[]> = {};
  Object.entries(allMappings).forEach(([synonym, canonical]) => {
    if (!grouped[canonical]) grouped[canonical] = [];
    grouped[canonical].push(synonym);
  });

  // RDF Graph representation
  const rdfTriples = scke.getOntologyRDF();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">Semantic Ontology Map</h2>
          <p className="text-slate-400 font-medium">Visualization of medical term mappings within the SCKE knowledge layer.</p>
        </div>
        
        <div className="flex bg-white/5 p-2 rounded-2xl w-fit border border-white/5 shadow-2xl">
          <button 
            onClick={() => setViewMode('visual')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${viewMode === 'visual' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Layers size={16} /> Synonyms View
          </button>
          <button 
            onClick={() => setViewMode('rdf')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${viewMode === 'rdf' ? 'bg-slate-800 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Network size={16} /> RDF Triples View
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
          {Object.entries(grouped).map(([canonical, synonyms], i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl hover:border-white/10 transition-all group">
              <div className={`p-8 ${canonical.includes('Allergy') ? 'bg-rose-500/10 border-b border-rose-500/20' : 'bg-white/5 border-b border-white/5'}`}>
                <h3 className={`font-black text-xl tracking-tight flex items-center gap-4 ${canonical.includes('Allergy') ? 'text-rose-400' : 'text-blue-400'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-2xl ${canonical.includes('Allergy') ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400' : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'}`}>
                    {canonical.includes('Allergy') ? <Zap size={18} /> : <HeartPulse size={18} />}
                  </div>
                  {canonical}
                </h3>
              </div>
              <div className="p-8 space-y-5">
                <p className="text-[11px] uppercase font-black text-slate-500 tracking-widest">Mapped Expressions</p>
                <div className="flex flex-wrap gap-3">
                  {synonyms.map((s, si) => (
                    <span key={si} className="text-[11px] px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-slate-300 font-bold uppercase tracking-wider shadow-2xl">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/5 px-10 py-8 border-b border-white/5 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center shadow-2xl">
              <Database size={28} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-base uppercase tracking-widest">Underlying Knowledge Graph</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Resource Description Framework (RDF)</p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 sticky top-0 border-b border-white/5 text-[11px] font-black text-slate-500 uppercase tracking-widest z-10">
                <tr>
                  <th className="p-6 pl-10">Subject</th>
                  <th className="p-6 border-l border-white/5">Predicate</th>
                  <th className="p-6 border-l border-white/5 pr-10">Object</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs bg-transparent">
                {rdfTriples.map((triple, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 pl-10 text-blue-400 break-words max-w-[200px]">{triple.subject}</td>
                    <td className="p-6 border-l border-white/5 text-slate-300">
                      <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{triple.predicate}</span>
                    </td>
                    <td className="p-6 border-l border-white/5 text-emerald-400 break-words max-w-[200px]">{triple.object}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shrink-0 shadow-2xl">
            <Wand2 size={32} />
          </div>
          <div className="space-y-3">
            <h3 className="text-base font-black text-white uppercase tracking-widest">Intelligent Graph Normalization</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              The SCKE semantic layer maps all disparate medical data as RDF Triples. By asserting <span className="font-mono bg-slate-950 border border-white/10 text-blue-400 px-2 py-1 rounded shadow-2xl">owl:sameAs</span> rules, 
              the reasoner infers that informal descriptions (like "sugar disease") or abbreviations (like "HTN") point to exactly the same canonical nodes in SNOMED or ICD-10.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OntologyMap;
