import React, { useState } from 'react';
import { scke } from '../services/sckeService';
import { Patient } from '../types';

const RegisterPatient: React.FC = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    age: 0, 
    national_id: '',
    id_type: 'Aadhar' as 'Aadhar' | 'Blockchain',
    notes: '',
    files: null as FileList | null
  });
  const [result, setResult] = useState<Patient | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = await scke.registerPatient(formData.name, formData.age, formData.national_id, formData.id_type);
    setResult(patient);
    setFormData({ name: '', age: 0, national_id: '', id_type: 'Aadhar', notes: '', files: null });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white tracking-tight">Register New Patient</h2>
        <p className="text-slate-400 font-medium mt-3">Generate a universal PAT-ID and secure access key.</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-600 font-medium"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Age</label>
              <input
                required
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-600 font-medium"
                placeholder="45"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">ID Type</label>
              <select
                value={formData.id_type}
                onChange={(e) => setFormData({...formData, id_type: e.target.value as 'Aadhar' | 'Blockchain'})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="Aadhar" className="bg-slate-900">Aadhar (Simulated)</option>
                <option value="Blockchain" className="bg-slate-900">Blockchain Hash</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Unique ID Value</label>
              <input
                required
                type="text"
                value={formData.national_id}
                onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-600 font-medium"
                placeholder={formData.id_type === 'Aadhar' ? '1234-5678-9012' : '0x888...'}
              />
            </div>

            <div className="col-span-2 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Initial Medical Data (Optional)</p>
              <p className="text-xs text-slate-500 mb-6">If you have existing records, please upload your last doctor visit prescription and blood test report for immediate semantic indexing.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Upload Documents (PDF/Image)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFormData({...formData, files: e.target.files})}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-600 font-medium h-24 resize-none"
                    placeholder="Allergies, chronic conditions, or recent surgeries..."
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all"
          >
            Generate Universal ID
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[3.5rem] animate-in zoom-in duration-300 relative overflow-hidden">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10 shadow-2xl">
              <i className="fas fa-check-circle text-3xl"></i>
            </div>
            <div>
              <h4 className="font-black text-white text-2xl tracking-tight">Registration Successful</h4>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Universal Health ID Generated</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Universal Patient ID</p>
              <p className="font-black text-blue-400 text-3xl tracking-wider">{result.id}</p>
            </div>
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 shadow-2xl">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Secure Access Key</p>
              <p className="font-black text-emerald-400 text-3xl tracking-wider">{result.secure_key}</p>
            </div>
          </div>
          <p className="mt-10 text-xs text-slate-400 font-medium leading-relaxed italic flex items-start gap-3">
            <i className="fas fa-info-circle text-emerald-400 mt-1"></i> 
            Provide these credentials to the patient. They are required for portal access and data ownership verification.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterPatient;