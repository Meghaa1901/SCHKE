import React, { useState } from 'react';
import { scke } from '../services/sckeService';
import { Patient, Prescription } from '../types';

interface UpdateRecordsProps {
  hospitalId: string;
}

const UpdateRecords: React.FC<UpdateRecordsProps> = ({ hospitalId }) => {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<Prescription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    const found = await scke.getPatient(patientId);
    if (found) {
      setPatient(found);
    } else {
      setError('Patient not found in the global index.');
      setPatient(null);
    }
    setIsSearching(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patient) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const result = await scke.processPrescription(hospitalId, patient.id, base64);
          setUploadResult(result);
          // Refresh patient data to show updated conditions/meds
          setPatient((await scke.getPatient(patient.id)) || null);
        } catch (err) {
          setError('AI Analysis failed. Please ensure the image is clear.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('File reading failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">Update Patient Records</h2>
        <p className="text-slate-400 font-medium">Search for a patient and upload clinical documents (prescriptions, test reports) for AI-powered synchronization.</p>
      </div>

      {/* Search Section */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 shadow-2xl">
        <form onSubmit={handleSearch} className="flex gap-6">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Universal PAT-ID (e.g., PAT-DEMO)"
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/5 text-white font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-600"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !patientId}
            className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-2xl shadow-blue-500/20"
          >
            {isSearching ? <i className="fas fa-circle-notch fa-spin text-xl"></i> : 'Search'}
          </button>
        </form>
        {error && <p className="mt-5 text-rose-400 text-[11px] font-black uppercase tracking-widest ml-3 flex items-center gap-3"><i className="fas fa-exclamation-triangle"></i>{error}</p>}
      </div>

      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-bottom-4 duration-500">
          {/* Patient Info Card */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-2xl">
                  <i className="fas fa-user text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tight text-xl">{patient.name}</h3>
                  <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Universal Patient ID: {patient.id}</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Current Conditions</p>
                  <div className="flex flex-wrap gap-3">
                    {patient.conditions.map((c, i) => (
                      <span key={i} className="px-4 py-2 bg-white/5 text-slate-300 text-[11px] font-bold rounded-xl border border-white/5 shadow-2xl">
                        {c}
                      </span>
                    ))}
                    {patient.conditions.length === 0 && <span className="text-[11px] text-slate-500 italic">No conditions recorded</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Active Medications</p>
                  <div className="flex flex-wrap gap-3">
                    {patient.medications.map((m, i) => (
                      <span key={i} className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[11px] font-bold rounded-xl border border-blue-500/20 shadow-2xl">
                        {m}
                      </span>
                    ))}
                    {patient.medications.length === 0 && <span className="text-[11px] text-slate-500 italic">No medications recorded</span>}
                  </div>
                </div>
                {patient.lab_results && patient.lab_results.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Recent Lab Results</p>
                    <div className="space-y-3">
                      {patient.lab_results.slice(-3).reverse().map((lab, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center shadow-2xl">
                          <div>
                            <p className="text-[11px] font-black text-white">{lab.test_name}</p>
                            <p className="text-[9px] text-slate-500 font-bold">{new Date(lab.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-[11px] font-black ${lab.status === 'abnormal' || lab.status === 'critical' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {lab.value} {lab.unit}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase font-black">{lab.status || 'normal'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
                <i className="fas fa-file-medical text-blue-400"></i> Upload Clinical Document
              </h3>

              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className={`p-20 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center text-center ${isUploading ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/5 group-hover:border-blue-500/30 group-hover:bg-blue-500/10'}`}>
                  {isUploading ? (
                    <>
                      <div className="w-20 h-20 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin mb-8"></div>
                      <p className="text-base font-black text-white">AI Analyzing Document...</p>
                      <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-3">Extracting clinical markers</p>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-[2rem] bg-slate-800 flex items-center justify-center text-slate-500 mb-8 group-hover:text-blue-400 group-hover:scale-110 transition-all shadow-2xl border border-white/5">
                        <i className="fas fa-cloud-upload-alt text-4xl"></i>
                      </div>
                      <p className="text-base font-black text-white">Drop report or click to upload</p>
                      <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-3">Supports JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
              </div>

              {uploadResult && (
                <div className="mt-12 p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] animate-in zoom-in duration-300 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fas fa-check-circle text-emerald-400 text-2xl"></i>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">AI Extraction Complete</h4>
                  </div>
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-900/60 rounded-3xl border border-white/5 shadow-2xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">AI Summary</p>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"{uploadResult.ai_explanation}"</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {uploadResult.extracted_terms.map((term, i) => (
                        <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-2xl">{term}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateRecords;