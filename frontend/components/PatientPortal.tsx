import React, { useState, useEffect } from 'react';
import { scke } from '../services/sckeService';
import { Patient, Prescription, AccessLog } from '../types';

interface PatientPortalProps {
  patientId: string;
}

const PatientPortal: React.FC<PatientPortalProps> = ({ patientId }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    refreshData();
  }, [patientId]);

  const refreshData = async () => {
    const p = await scke.getPatient(patientId);
    if (p) {
      setPatient({ ...p });
      setPrescriptions(scke.getPrescriptions(patientId));
      setLogs(scke.getAccessLogs(patientId));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setIsUploading(true);
      try {
        await scke.processPrescription('PATIENT_SELF_UPLOAD', patientId, reader.result as string);
        refreshData();
      } catch (err: any) {
        console.error("Upload Error in Patient Portal:", err);
        alert(`AI Analysis failed: ${err.message || 'Please check the console for details.'}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!patient) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-16 animate-in fade-in duration-700">
      {/* Header Card */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="w-28 h-28 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-400 text-5xl border border-blue-500/20 shadow-2xl relative z-10">
          <i className="fas fa-user-circle"></i>
        </div>
        
        <div className="text-center md:text-left flex-1 relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-5xl font-black text-white tracking-tight">{patient.name}</h1>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">Verified</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-blue-400 bg-blue-500/10 px-5 py-2 rounded-xl uppercase tracking-widest border border-blue-500/20 shadow-2xl">Universal Patient ID • {patient.id}</span>
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1 ml-1 self-start">Network Identity: {patient.unique_id} ({patient.id_type})</span>
            </div>
            <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/10 px-5 py-2 rounded-xl uppercase tracking-widest border border-indigo-500/20 shadow-2xl self-start">Age: {patient.age}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 relative z-10">
          <input type="file" accept="image/*" id="p-rx-upload" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
          <label htmlFor="p-rx-upload" className={`cursor-pointer px-10 py-5 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-2xl shadow-blue-500/20 ${isUploading ? 'opacity-75 cursor-wait' : ''}`}>
            {isUploading ? <i className="fas fa-circle-notch fa-spin text-xl"></i> : <i className="fas fa-cloud-upload-alt text-xl"></i>}
            {isUploading ? 'AI Analyzing...' : 'Upload Prescription'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shadow-2xl"><i className="fas fa-heartbeat"></i></div>
              Health Conditions
            </h3>
            <div className="flex flex-wrap gap-3">
              {patient.conditions && patient.conditions.length > 0 ? patient.conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-300 uppercase tracking-wider shadow-2xl">
                  <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                  {cond}
                </div>
              )) : <p className="text-xs text-slate-500 italic px-2">No active conditions recorded.</p>}
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-2xl"><i className="fas fa-pills"></i></div>
              Active Medications
            </h3>
            <div className="flex flex-wrap gap-3">
              {patient.medications && patient.medications.length > 0 ? patient.medications.map((med, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-[11px] font-black text-blue-400 uppercase tracking-wider shadow-2xl">
                  <i className="fas fa-capsules text-blue-400 text-xs"></i>
                  {med}
                </div>
              )) : <p className="text-xs text-slate-500 italic px-2">No medication history found.</p>}
            </div>
          </div>

          {/* Blood Test Reports Section */}
          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl"><i className="fas fa-file-medical-alt"></i></div>
              Blood Test Reports
            </h3>
            
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-8">
              A blood test report provides a snapshot of overall health, measuring key components of blood, metabolic functions, and organ health to detect conditions like infection, anemia, and diabetes. It typically includes a Complete Blood Count (CBC) (white/red cells, platelets, hemoglobin) and a metabolic panel (electrolytes, glucose, kidney/liver enzymes).
            </p>

            <div className="space-y-6">
              {(!patient.blood_test_reports || patient.blood_test_reports.length === 0) ? (
                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> Missing Data
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    No blood test report found. Please upload a recent test for accurate health analysis.
                  </p>
                  <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest mt-4">
                    It is recommended to undergo a health check-up and blood test every 6 months.
                  </p>
                </div>
              ) : (
                patient.blood_test_reports.map((report, i) => {
                  const reportDate = new Date(report.reportDate);
                  const sixMonthsAgo = new Date();
                  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                  const isExpired = reportDate < sixMonthsAgo;

                  return (
                    <div key={i} className={`p-6 rounded-3xl border transition-all shadow-2xl ${isExpired ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-widest">{report.testType}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{report.reportDate}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${isExpired ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                          {isExpired ? 'Expired' : 'Valid'}
                        </span>
                      </div>
                      
                      {isExpired && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <i className="fas fa-clock"></i> Outdated Report
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Your blood test report is outdated. Please upload a new report.
                          </p>
                          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-3">
                            It is recommended to undergo a health check-up and blood test every 6 months.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Hemoglobin: <span className="text-white">{report.hemoglobin}</span></p>
                          <p className="text-[9px] font-black text-slate-500 uppercase">WBC: <span className="text-white">{report.whiteBloodCells}</span></p>
                          <p className="text-[9px] font-black text-slate-500 uppercase">Glucose: <span className="text-white">{report.glucose}</span></p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Sodium: <span className="text-white">{report.sodium}</span></p>
                          <p className="text-[9px] font-black text-slate-500 uppercase">Potassium: <span className="text-white">{report.potassium}</span></p>
                          <p className="text-[9px] font-black text-slate-500 uppercase">Kidney: <span className="text-white">{report.kidneyMarkers}</span></p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {patient.lab_results && patient.lab_results.length > 0 && (
            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl"><i className="fas fa-vial"></i></div>
                Lab Reports
              </h3>
              <div className="space-y-5">
                {patient.lab_results.slice().reverse().map((lab, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group shadow-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[11px] font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-widest">{lab.test_name}</p>
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${lab.status === 'abnormal' || lab.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {lab.status || 'normal'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-black text-white tracking-tight">{lab.value} <span className="text-xs font-bold text-slate-500">{lab.unit}</span></p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Ref: {lab.reference_range || 'N/A'}</p>
                      </div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(lab.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center gap-6 ml-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-2xl"><i className="fas fa-stream"></i></div>
            <h3 className="text-3xl font-black text-white tracking-tight">Timeline & AI Summaries</h3>
          </div>

          {isUploading && (
            <div className="bg-blue-600/10 p-12 rounded-[3.5rem] border border-blue-500/20 text-center animate-pulse shadow-2xl">
              <i className="fas fa-robot text-5xl text-blue-400 mb-8 animate-bounce"></i>
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Medical LLM is extracting clinical data...</p>
            </div>
          )}

          <div className="space-y-10">
            {prescriptions.length === 0 && !isUploading ? (
              <div className="bg-slate-900/40 backdrop-blur-3xl p-24 rounded-[4rem] border border-white/5 shadow-2xl text-center">
                <div className="w-28 h-28 mx-auto bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-700 mb-10 border border-white/5 shadow-2xl">
                  <i className="fas fa-file-medical text-5xl"></i>
                </div>
                <h4 className="text-2xl font-black text-white mb-3">No records found</h4>
                <p className="text-slate-500 font-medium">Upload a prescription image to start building your semantic health profile.</p>
              </div>
            ) : (
              prescriptions.slice().reverse().map((rx) => (
                <div key={rx.id} className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl hover:border-white/10 transition-all group">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 shadow-2xl border border-white/5 group-hover:text-blue-400 transition-colors">
                        <i className="fas fa-file-prescription text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-black text-white text-2xl tracking-tight uppercase">{rx.id}</h4>
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-2">
                          {rx.hospital_id} • {new Date(rx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-600/10 p-10 rounded-[2.5rem] border border-blue-500/20 mb-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                      <i className="fas fa-language text-xs"></i> Plain English Translation
                    </p>
                    <p className="text-xl text-slate-300 leading-relaxed font-medium italic">
                      "{rx.ai_explanation}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {rx.extracted_terms.map((term, i) => (
                      <span key={i} className="text-[10px] bg-white/5 text-slate-400 px-5 py-2.5 rounded-xl uppercase font-black tracking-widest border border-white/5 shadow-2xl">{term}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-4">
          <i className="fas fa-shield-alt text-emerald-500"></i> Audit Log
        </h3>
        <div className="bg-slate-950/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          {logs.slice().reverse().map((log, i) => (
            <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <span className="text-slate-300 font-bold text-sm flex items-center gap-4">
                <i className="fas fa-arrow-right text-[10px] text-slate-600"></i>
                {log.action} 
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 shadow-2xl">{log.hospital_id}</span>
              </span>
              <span className="text-slate-500 text-[10px] mt-3 sm:mt-0 font-black uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;