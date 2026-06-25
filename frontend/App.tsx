
import React, { useState } from 'react';
import { Hospital, UserRound, ArrowRight, ShieldCheck, HeartPulse, Power, LogOut } from 'lucide-react';
import { scke } from './services/sckeService';
import { PortalType, Patient } from './types';
import PatientPortal from './components/PatientPortal';
import Login from './components/Login';
import HospitalShell from './components/HospitalShell';

const App: React.FC = () => {
  const [portal, setPortal] = useState<PortalType>('NONE');
  const [user, setUser] = useState<any>(null);

  const handleLogout = () => {
    setPortal('NONE');
    setUser(null);
  };

  if (portal === 'NONE') {
    return (
      <div className="min-h-screen bg-[#020617] relative overflow-hidden flex items-center justify-center p-6 font-sans">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)]"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-5xl w-full relative z-10">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
              SCHKE <span className="text-blue-500">NETWORK</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
              Secure Semantic Cross-Hospital Knowledge Exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div 
              onClick={() => setPortal('HOSPITAL')}
              className="group cursor-pointer bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/10 hover:border-blue-500/50 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] shadow-xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500">
                <Hospital size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Hospital</h2>
              <p className="text-slate-400 font-bold leading-relaxed">Authorized healthcare providers. Connect to the semantic knowledge exchange layer.</p>
              <div className="mt-8 flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Initialize Connection <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

            <div 
              onClick={() => setPortal('PATIENT')}
              className="group cursor-pointer bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/10 hover:border-indigo-500/50 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500">
                <UserRound size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Patient Portal</h2>
              <p className="text-slate-400 font-bold leading-relaxed">Personal health ownership. View your unified records and AI-translated clinical notes.</p>
              <div className="mt-8 flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Access Records <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center gap-8 opacity-40 animate-in fade-in duration-1000 delay-500">
            {['End-to-End', 'AES-256', 'HIPAA', 'FHIR R4'].map(badge => (
              <div key={badge} className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white uppercase">
                <ShieldCheck size={12} className="text-blue-500" /> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        portal={portal} 
        onLogin={(userData) => setUser(userData)} 
        onBack={() => setPortal('NONE')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] font-sans">
      {/* Floating Logout for Hospital */}
      {portal === 'HOSPITAL' && (
        <button 
          onClick={handleLogout}
          className="fixed top-6 right-6 z-[60] px-6 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center"
        >
          <LogOut size={14} className="mr-2 text-blue-400" /> Logout System
        </button>
      )}

      {portal === 'HOSPITAL' ? (
        <HospitalShell hospitalId={user.id} />
      ) : (
        <>
          <nav className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-between px-10 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-600 text-white shadow-2xl">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="font-black tracking-tighter text-2xl text-white">My-SCHKE <span className="text-blue-400 font-medium">{portal}</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {portal === 'PATIENT' ? `Universal ID: ${user.id}` : `ID Verified (${user.id_type || 'System'})`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-white">{user.name || user.id}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">{portal} NODE ACTIVE</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
            title="Logout"
          >
            <Power size={20} />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-8 max-w-7xl mx-auto">
        <PatientPortal patientId={user.id} />
      </main>
    </>
    )}
    </div>
  );
};

export default App;
