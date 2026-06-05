
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  RefreshCw, 
  Loader2, 
  Target, 
  History, 
  Network, 
  ShieldCheck, 
  Terminal, 
  Stethoscope, 
  Send, 
  Server, 
  Upload, 
  GitMerge, 
  Globe, 
  Quote, 
  UserRound 
} from 'lucide-react';
import { federatedService, HospitalNode, GlobalModel, DiagnosticPrediction } from '../services/federatedService';

const FederatedDashboard: React.FC = () => {
  const [nodes, setNodes] = useState<HospitalNode[]>(federatedService.getNodes());
  const [globalModel, setGlobalModel] = useState<GlobalModel>(federatedService.getGlobalModel());
  const [isRunning, setIsRunning] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string>();
  const [pulses, setPulses] = useState<string[]>([]);
  const [tab, setTab] = useState<'network' | 'how'>('network');
  
  // Diagnose state
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [patientAge, setPatientAge] = useState(45);
  const [predictions, setPredictions] = useState<DiagnosticPrediction[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    federatedService.onUpdate((event) => {
      if (event.type === 'NODE_TRAINING' || event.type === 'NODE_SYNCING') {
        setActiveNodeId(event.nodeId);
        setPulses(prev => [...new Set([...prev, event.nodeId])]);
        setNodes(federatedService.getNodes());
      } else if (event.type === 'ROUND_COMPLETE') {
        setIsRunning(false);
        setActiveNodeId(undefined);
        setPulses([]);
        setNodes(federatedService.getNodes());
        setGlobalModel(federatedService.getGlobalModel());
      }
    });
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progressLog]);

  const runRound = async () => {
    setIsRunning(true);
    setProgressLog([]);
    await federatedService.runFederatedRound((msg) => {
      setProgressLog(prev => [...prev, msg]);
    });
  };

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    const results = await federatedService.predictDiagnosis(symptoms, patientAge);
    setPredictions(results);
    setIsDiagnosing(false);
  };

  const availableSymptoms = [
    'chest pain', 'fatigue', 'shortness of breath', 'headache', 'joint pain', 'vision blur',
    'persistent cough', 'unexplained weight loss', 'lump/swelling', 'night sweats', 'fever', 'abdominal pain', 'skin change'
  ];

  return (
    <div className="min-h-screen p-10 font-sans text-white bg-[#020617]">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
            <Brain size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-4">
              Federated Intelligence Network
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
              </span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Decentralized AI Training Layer</p>
          </div>
        </div>

        <button
          onClick={runRound}
          disabled={isRunning}
          className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-2xl ${isRunning ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
        >
          {isRunning ? <><Loader2 size={16} className="animate-spin" /> Training...</> : <><RefreshCw size={16} /> Run Federated Round</>}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Global Accuracy', value: `${(globalModel.accuracy * 100).toFixed(1)}%`, sub: 'Collective Intelligence', icon: Target, color: 'text-blue-400' },
          { label: 'Training Rounds', value: globalModel.totalTrainingRounds, sub: 'Zero data transferred', icon: History, color: 'text-indigo-400' },
          { label: 'Hospital Nodes', value: nodes.length, sub: `${nodes.reduce((s, n) => s + n.recordCount, 0).toLocaleString()} collective cases`, icon: Network, color: 'text-emerald-400' },
          { label: 'Privacy Guarantee', value: '100%', sub: 'No patient data ever moved', icon: ShieldCheck, color: 'text-rose-400' },
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 shadow-2xl group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="text-4xl font-black text-white tracking-tight">{stat.value}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-tight">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-3xl rounded-2xl w-fit mb-12 border border-white/5 shadow-2xl">
        {(['network', 'how'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t === 'how' ? 'How It Works' : 'Network'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'network' && (
        <div className="space-y-10 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* SVG Graph */}
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 p-12 relative overflow-hidden h-[500px] shadow-2xl">
              <div className="absolute top-8 left-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Live Network Topology</div>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Connections */}
                {nodes.map(node => (
                  <g key={`conn-${node.id}`}>
                    <line
                      x1="50" y1="50" x2={node.location.x} y2={node.location.y}
                      stroke={pulses.includes(node.id) ? '#3b82f6' : '#ffffff'}
                      strokeWidth={pulses.includes(node.id) ? "1" : "0.2"}
                      strokeDasharray={pulses.includes(node.id) ? "" : "1,1"}
                      opacity={pulses.includes(node.id) ? "0.6" : "0.1"}
                    />
                    {pulses.includes(node.id) && (
                      <circle r="1" fill="#3b82f6">
                        <animateMotion
                          dur="1s"
                          repeatCount="indefinite"
                          path={`M 50 50 L ${node.location.x} ${node.location.y}`}
                        />
                      </circle>
                    )}
                  </g>
                ))}

                {/* Center Node */}
                <circle cx="50" cy="50" r="5" fill="#3b82f6" />
                <circle cx="50" cy="50" r="8" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.5">
                  <animate attributeName="r" from="5" to="15" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="50" y="62" textAnchor="middle" fill="#3b82f6" fontSize="4" fontWeight="black">SCKE CORE</text>

                {/* Hospital Nodes */}
                {nodes.map(node => (
                  <g key={node.id}>
                    <circle
                      cx={node.location.x} cy={node.location.y} r="3"
                      fill={node.status === 'training' ? '#f59e0b' : node.status === 'syncing' ? '#3b82f6' : '#10b981'}
                      className="transition-all duration-500"
                    />
                    {node.status === 'training' && (
                      <circle cx={node.location.x} cy={node.location.y} r="5" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1,1">
                        <animateTransform attributeName="transform" type="rotate" from={`0 ${node.location.x} ${node.location.y}`} to={`360 ${node.location.x} ${node.location.y}`} dur="3s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text x={node.location.x} y={node.location.y + 8} textAnchor="middle" fill="#64748b" fontSize="3" fontWeight="bold" opacity="0.8">{node.id}</text>
                  </g>
                ))}
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-10 left-12 flex gap-6">
                {[
                  { label: 'Online', color: 'bg-emerald-500' },
                  { label: 'Training', color: 'bg-amber-500' },
                  { label: 'Syncing', color: 'bg-blue-500' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${l.color}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accuracy Chart & Node List */}
            <div className="space-y-10">
              {/* Accuracy Chart */}
              <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Intelligence Growth</span>
                  <span className="text-[11px] font-black text-blue-400">v{globalModel.version} Global Model</span>
                </div>
                <div className="h-32 w-full">
                  <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area */}
                    <path
                      d={`M 0 80 ${globalModel.improvementHistory.map((h, i) => `L ${(i / (globalModel.improvementHistory.length - 1)) * 300} ${80 - (h.accuracy * 60)}`).join(' ')} L 300 80 Z`}
                      fill="url(#chartGradient)"
                    />
                    {/* Line */}
                    <path
                      d={globalModel.improvementHistory.map((h, i) => `${i === 0 ? 'M' : 'L'} ${(i / (globalModel.improvementHistory.length - 1)) * 300} ${80 - (h.accuracy * 60)}`).join(' ')}
                      fill="none" stroke="#3b82f6" strokeWidth="2.5"
                    />
                    {/* Dots */}
                    {globalModel.improvementHistory.map((h, i) => (
                      <circle key={i} cx={(i / (globalModel.improvementHistory.length - 1)) * 300} cy={80 - (h.accuracy * 60)} r="3" fill="#3b82f6" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Node List */}
              <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Participating Nodes</span>
                </div>
                <div className="divide-y divide-white/5">
                  {nodes.map(node => (
                    <div key={node.id} className={`p-6 flex items-center justify-between transition-all ${activeNodeId === node.id ? 'bg-blue-600/10' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${node.status === 'training' ? 'bg-amber-500 animate-pulse' : node.status === 'syncing' ? 'bg-blue-500 animate-bounce' : 'bg-emerald-500'}`}></div>
                        <div>
                          <div className="text-sm font-black text-white">{node.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">{node.id} • {node.recordCount.toLocaleString()} Records</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[11px] font-black uppercase tracking-widest ${node.status === 'training' ? 'text-amber-400' : node.status === 'syncing' ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {node.status}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">v{node.modelVersion} Model</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          {(isRunning || progressLog.length > 0) && (
            <div className="bg-slate-950 rounded-[2.5rem] border border-white/5 p-10 font-mono text-[11px] h-64 overflow-y-auto scrollbar-hide shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-slate-500 border-b border-white/5 pb-4">
                <Terminal size={16} />
                <span className="uppercase tracking-[0.2em] font-black">Federated Training Log</span>
              </div>
              <div className="space-y-2">
                {progressLog.map((log, i) => (
                  <div key={i} className="text-slate-400">
                    <span className="text-blue-500 mr-3">›</span> {log}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'how' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
          {/* Explainer */}
          <div className="space-y-6">
            {[
              { step: '01', title: 'SCKE sends a blank model', desc: 'A global model architecture is distributed to all participating hospital nodes.', icon: Send, color: 'text-blue-400' },
              { step: '02', title: 'Each hospital trains locally', desc: 'Hospitals train the model on their own private patient data behind their firewall.', icon: Server, color: 'text-indigo-400' },
              { step: '03', title: "Only 'what I learned' is shared", desc: 'Hospitals upload only the model weights (mathematical updates), never patient records.', icon: Upload, color: 'text-emerald-400' },
              { step: '04', title: 'SCKE aggregates all learnings', desc: 'The core layer averages the weights using the FedAvg algorithm to create a smarter global model.', icon: GitMerge, color: 'text-purple-400' },
              { step: '05', title: 'Everyone gets smarter', desc: 'The improved model is sent back to all nodes, enabling specialist-level diagnostics everywhere.', icon: Globe, color: 'text-rose-400' },
            ].map((s, i) => (
              <div key={i} className="flex gap-8 p-8 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 shadow-2xl">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-black text-white border border-white/10">
                  {s.step}
                </div>
                <div>
                  <h4 className="text-lg font-black text-white mb-2 flex items-center gap-3">
                    <s.icon size={20} className={s.color} /> {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Impact & Quote */}
          <div className="space-y-10">
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 p-12 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-12 tracking-tight">Global Impact</h3>
              <div className="space-y-10">
                {[
                  { val: '2.6M', label: 'deaths/year from medication errors', color: 'text-rose-500' },
                  { val: '40%', label: 'of diseases misdiagnosed in low-income countries', color: 'text-amber-500' },
                  { val: '800M', label: 'people lack specialist diagnostic access', color: 'text-blue-400' },
                  { val: '0', label: 'patient records need to move for SCKE to work', color: 'text-emerald-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-8">
                    <div className={`text-5xl font-black ${stat.color} w-32`}>{stat.val}</div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-12 rounded-[3.5rem] bg-white/5 backdrop-blur-3xl border border-white/5 relative overflow-hidden shadow-2xl">
              <Quote size={80} className="absolute top-8 left-8 text-white/5" />
              <p className="text-lg font-bold text-slate-300 leading-relaxed relative z-10 italic">
                "A village doctor in Andhra Pradesh gets the diagnostic intelligence of a Harvard Medical School specialist — trained on data from hospitals they will never visit, from patients they will never meet."
              </p>
              <div className="mt-10 flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <UserRound size={20} />
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-blue-400">SCKE Research Vision</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FederatedDashboard;
