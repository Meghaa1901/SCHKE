import React from 'react';
import { scke } from '../services/sckeService';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hospitalId?: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, hospitalId = 'HOSP-01' }) => {
  const hospital = scke.getHospital(hospitalId);
  const tabs: { id: string; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'register', label: 'Register Patient', icon: 'fa-user-plus' },
    { id: 'exchange', label: 'Data Exchange', icon: 'fa-network-wired' },
    { id: 'update', label: 'Update Records', icon: 'fa-file-medical' },
    { id: 'ontology', label: 'Ontology Map', icon: 'fa-project-diagram' },
    { id: 'diagnosis', label: 'AI Assistant', icon: 'fa-microscope' },
    { id: 'logs', label: 'Security Logs', icon: 'fa-shield-alt' },
  ];

  return (
    <nav className="h-screen flex flex-col font-sans bg-slate-900/40 backdrop-blur-3xl border-r border-white/5">
      <div className="p-10">
        {/* Logo Area */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
            <i className="fas fa-stethoscope text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none">SCHKE</h1>
            <p className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest mt-1">Hospital Node</p>
          </div>
        </div>

        {/* Network Status Card */}
        <div className="mb-10 p-5 rounded-3xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Network Online</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">{hospitalId}</div>
        </div>
        
        {/* Nav Items */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all group ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <i className={`fas ${tab.icon} w-5 text-center ${activeTab === tab.id ? 'text-white' : 'group-hover:text-blue-400'}`}></i>
                {tab.label}
              </div>
              {tab.badge && (
                <span className="px-2 py-0.5 rounded-md bg-blue-400 text-[8px] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-10 border-t border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white text-sm font-black border border-white/10">
            {hospital?.name?.substring(0, 2).toUpperCase() || 'HN'}
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate max-w-[160px]">{hospital?.name || 'Hospital Node'}</p>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[160px]">{hospital?.managedBy || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;