
import React, { useState, useEffect, useRef } from 'react';
import { scke } from '../services/sckeService';
import { PortalType } from '../types';

interface LoginProps {
  portal: PortalType;
  onLogin: (user: any) => void;
  onBack: () => void;
}

type AuthStep = 'credentials' | 'register';

const Login: React.FC<LoginProps> = ({ portal, onLogin, onBack }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [patId, setPatId] = useState('');
  const [secureKey, setSecureKey] = useState('');
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number>(0);
  const [regUniqueId, setRegUniqueId] = useState('');
  const [regIdType, setRegIdType] = useState<'Aadhar' | 'Blockchain'>('Aadhar');
  
  const [error, setError] = useState('');
  const [generatedPatId, setGeneratedPatId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [isHospital] = useState(portal === 'HOSPITAL');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isHospital) {
      const hospital = scke.getHospital(patId);
      if (hospital) {
        onLogin(hospital);
      } else {
        setError('Authorized Hospital ID not found.');
      }
    } else {
      if (!patId.startsWith('PAT-')) {
        setError('Invalid PAT-ID format. (Expected: PAT-XXXXX)');
        return;
      }
      const patient = scke.validatePatient(patId, secureKey);
      if (patient) {
        onLogin(patient);
      } else {
        setError('Invalid PAT-ID or Secure Key.');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isHospital) {
       setError('Hospital registration must be handled by network administrator.');
       return;
    }

    if (!regName || !regAge || !regUniqueId) {
      setError('All fields are required.');
      return;
    }

    if (regIdType === 'Aadhar' && !/^\d{12}$/.test(regUniqueId)) {
      setError('Aadhar must be a 12-digit number.');
      return;
    }

    try {
      const patient = scke.registerPatient(regName, regAge, regUniqueId, regIdType);
      setGeneratedPatId(patient.id);
      setGeneratedKey(patient.secure_key || '');
      setPatId(patient.id);
      setSecureKey(patient.secure_key || '');
    } catch (err) {
      setError('Registration failed.');
    }
  };

  const handleDemo = () => {
    const demoId = isHospital ? 'HOSP-DEMO' : 'PAT-DEMO';
    const demoKey = isHospital ? '' : 'DEMO-123';
    
    if (isHospital) {
      const hospital = scke.getHospital(demoId);
      onLogin(hospital);
    } else {
      const patient = scke.validatePatient(demoId, demoKey);
      onLogin(patient);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-[#020617] font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)]"></div>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-xl w-full relative z-10">
        <button onClick={onBack} className="mb-8 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400">
          <i className="fas fa-arrow-left"></i> Back to selection
        </button>

        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-10 text-center border-b border-white/5 bg-white/5">
             <div className="w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center text-white mb-6 relative group">
                <div className={`absolute inset-0 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity ${isHospital ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                <div className={`relative w-full h-full rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl ${isHospital ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                  <i className={`fas ${isHospital ? 'fa-hospital-alt' : 'fa-id-card'} text-3xl`}></i>
                </div>
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
                SCKE <span className={isHospital ? 'text-blue-400' : 'text-indigo-400'}>Portal</span>
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">
                {isHospital ? 'Authorized Medical Node Access' : 'Secure Patient Identity Layer'}
              </p>
          </div>

          {!isHospital && (
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => { setActiveTab('login'); setError(''); setGeneratedKey(''); }}
                className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'login' ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Login Access
              </button>
              <button 
                onClick={() => { setActiveTab('register'); setError(''); setGeneratedKey(''); }}
                className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'register' ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="p-10">
            {generatedPatId ? (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-emerald-500/40">
                    <i className="fas fa-check text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Identity Synthesized</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Store your clinical credentials safely.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Universal Patient ID</div>
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black">PAT-ID</span>
                    </div>
                    <div className="text-lg font-mono font-black text-white">{generatedPatId}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Secure Access Key</div>
                    <div className="text-lg font-mono font-black text-emerald-400 tracking-wider uppercase">{generatedKey}</div>
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveTab('login'); setGeneratedPatId(''); }}
                  className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all hover:bg-blue-500"
                >
                  Proceed to Login
                </button>
              </div>
            ) : activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <i className={`fas ${isHospital ? 'fa-hospital' : 'fa-id-badge'} absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-sm transition-colors group-focus-within:${isHospital ? 'text-blue-400' : 'text-indigo-400'}`}></i>
                    <input 
                      type="text" 
                      placeholder={isHospital ? "Hospital ID (e.g. HOSP-01)" : "Patient ID (e.g. PAT-XXXXX)"} 
                      value={patId}
                      onChange={(e) => setPatId(e.target.value)}
                      className={`w-full pl-16 pr-6 py-5 rounded-2xl border border-white/5 bg-white/5 outline-none text-sm font-bold text-white transition-all focus:ring-4 placeholder:text-slate-600 ${isHospital ? 'focus:border-blue-500/50 focus:ring-blue-500/5' : 'focus:border-indigo-500/50 focus:ring-indigo-500/5'}`}
                    />
                  </div>
                  
                  {!isHospital && (
                    <div className="relative group">
                      <i className="fas fa-key absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-sm transition-colors group-focus-within:text-indigo-400"></i>
                      <input 
                        type="password" 
                        placeholder="Secure Access Key" 
                        value={secureKey}
                        onChange={(e) => setSecureKey(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 rounded-2xl border border-white/5 bg-white/5 outline-none text-sm font-bold text-white transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-600"
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className={`w-full py-6 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${isHospital ? 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-500' : 'bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-500'}`}
                >
                  {isHospital ? 'Authenticate Node' : 'Initialize Session'}
                </button>

                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-x-0 h-[1px] bg-white/5"></div>
                  <span className="relative z-10 px-4 bg-slate-900/40 text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Developer Utility</span>
                </div>

                <button 
                  type="button"
                  onClick={handleDemo}
                  className="w-full py-5 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center gap-3 font-black text-[9px] uppercase tracking-[0.2em] transition-all text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <i className="fas fa-vial text-sm"></i> Load Demo Profile Node
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 outline-none text-sm font-bold text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-600"
                  />
                  
                  <input 
                    type="number" 
                    placeholder="Age" 
                    value={regAge || ''}
                    onChange={(e) => setRegAge(parseInt(e.target.value))}
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 outline-none text-sm font-bold text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-600"
                  />

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setRegIdType('Aadhar')}
                      className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${regIdType === 'Aadhar' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                      Aadhar ID
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegIdType('Blockchain')}
                      className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${regIdType === 'Blockchain' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                      Blockchain ID
                    </button>
                  </div>

                  <input 
                    type="text" 
                    placeholder={regIdType === 'Aadhar' ? "12 Digit Aadhar Number" : "Blockchain Wallet ID"} 
                    value={regUniqueId}
                    onChange={(e) => setRegUniqueId(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 outline-none text-sm font-bold text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-600"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all shadow-indigo-500/20"
                >
                  Generate Digital Identity
                </button>
              </form>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-in shake duration-300">
                <i className="fas fa-exclamation-triangle mr-2"></i> {error}
              </div>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex justify-center gap-10 opacity-40">
           <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-white">
              <i className="fas fa-shield-alt text-blue-500"></i> Identity Verified
           </div>
           <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-white">
              <i className="fas fa-at text-blue-500"></i> Zero-Knowledge Proof
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
