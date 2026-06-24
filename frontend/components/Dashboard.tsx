import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HOSPITALS } from '../constants';
import { scke } from '../services/sckeService';
import { AccessLog } from '../types';

interface DashboardProps {
  hospitalId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ hospitalId }) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    if (hospitalId) {
      scke.getHospitalLogs(hospitalId).then(all => setLogs(all.slice(-5).reverse()));
    }
  }, [hospitalId]);
  
  const stats = [
    { label: 'Source Hospitals', value: HOSPITALS.length.toString(), icon: 'fa-network-wired', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10', shadow: 'shadow-blue-500/20' },
    { label: 'Total Patients', value: '2,842', icon: 'fa-users', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', shadow: 'shadow-emerald-500/20' },
    { label: 'Semantic Mappings', value: '156', icon: 'fa-project-diagram', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/20' },
    { label: 'Data Integrity', value: '100%', icon: 'fa-shield-alt', color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', shadow: 'shadow-rose-500/20' },
  ];

  const chartData = HOSPITALS.map((h, i) => ({
    name: h.id,
    records: 300 + Math.floor(Math.random() * 500),
    color: ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f87171', '#818cf8'][i % 6]
  }));

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">Network Telemetry</h2>
          <p className="text-slate-400 font-medium">Global health data exchange status across all connected nodes.</p>
        </div>
        <div className="bg-emerald-500/10 px-8 py-4 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl border ${stat.bg} ${stat.border} ${stat.color}`}>
              <i className={`fas ${stat.icon} text-2xl`}></i>
            </div>
            
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">{stat.label}</p>
            <h3 className="text-5xl font-black text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-12 flex items-center gap-4">
            <i className="fas fa-chart-bar text-blue-400"></i> Records Extracted per Node
          </h3>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', color: '#fff', fontWeight: 'bold', fontSize: '13px', padding: '15px 25px' }}
                />
                <Bar dataKey="records" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
            <i className="fas fa-server text-emerald-400"></i> Connected Agents
          </h3>
          
          <div className="space-y-4">
            {HOSPITALS.map((h) => (
              <div key={h.id} className="flex flex-col p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <p className="text-base font-black text-white">{h.id}</p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                </div>
                <p className="text-sm font-medium text-slate-400">{h.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hospitalId && logs.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
              <i className="fas fa-shield-alt text-rose-400"></i> Recent Security Activity
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 5 Events</span>
          </div>
          
          <div className="space-y-4">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black border border-white/10 ${log.action.includes('RETRIEVE') ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    <i className={`fas ${log.action.includes('RETRIEVE') ? 'fa-search' : 'fa-exchange-alt'}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()} • Universal Patient ID: {log.patient_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;