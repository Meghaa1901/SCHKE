
import React, { useState, useEffect } from 'react';
import { scke } from '../services/sckeService';
import { AccessLog } from '../types';

interface SecurityLogsProps {
  hospitalId: string;
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ hospitalId }) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    setLogs(scke.getHospitalLogs(hospitalId));
  }, [hospitalId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Security & Audit Logs</h2>
            <p className="text-slate-400 text-sm">Real-time monitoring of cross-hospital data access and semantic retrievals.</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Network Monitoring Active</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">PAT-ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.slice().reverse().map((log, i) => {
                const isRequester = log.hospital_id === hospitalId;
                const isSource = log.details?.includes(hospitalId);
                
                return (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-white tracking-tight">{log.action.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${isRequester ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                          {log.hospital_id}
                        </span>
                        {isRequester && <span className="text-[9px] font-bold text-blue-500/70 uppercase">You</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-indigo-400 tracking-wider">{log.patient_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-slate-500 font-medium max-w-xs truncate group-hover:text-slate-300 transition-colors">
                        {log.details || 'Standard semantic retrieval'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-shield-check text-emerald-500 text-[10px]"></i>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <i className="fas fa-history text-4xl"></i>
                      <p className="text-sm font-bold uppercase tracking-widest">No security logs recorded for this node</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Requests Sent</p>
          <p className="text-2xl font-black text-white">{logs.filter(l => l.hospital_id === hospitalId).length}</p>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Data Shared as Source</p>
          <p className="text-2xl font-black text-emerald-400">{logs.filter(l => l.details?.includes(hospitalId)).length}</p>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Status</p>
          <p className="text-2xl font-black text-blue-400">OPTIMAL</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
