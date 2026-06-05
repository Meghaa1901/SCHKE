
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Zap, Play, RotateCcw, Brain, Activity, TrendingUp, Target, BarChart3 } from 'lucide-react';

interface MetricPoint {
  epoch: number;
  accuracy: number;
  loss: number;
  precision: number;
  recall: number;
}

const TrainingSimulation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const [showFinal, setShowFinal] = useState(false);

  const totalEpochs = 10;

  // Initialize data
  useEffect(() => {
    resetSimulation();
  }, []);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentEpoch(0);
    setHistory([]);
    setShowFinal(false);
  };

  const startSimulation = () => {
    if (currentEpoch >= totalEpochs) resetSimulation();
    setIsRunning(true);
    setShowFinal(false);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning && currentEpoch < totalEpochs) {
      timer = setInterval(() => {
        setCurrentEpoch(prev => {
          const next = prev + 1;
          
          // Generate realistic metrics
          // Accuracy: 58% to 94%
          // Loss: 0.9 to 0.15
          const progress = next / totalEpochs;
          const accuracy = parseFloat((58 + (36 * Math.pow(progress, 0.7)) + (Math.random() * 2)).toFixed(2));
          const loss = parseFloat((0.9 * Math.pow(0.2, progress) + (Math.random() * 0.05)).toFixed(3));
          const precision = parseFloat((60 + (32 * Math.pow(progress, 0.8)) + (Math.random() * 1.5)).toFixed(2));
          const recall = parseFloat((55 + (38 * Math.pow(progress, 0.9)) + (Math.random() * 1.5)).toFixed(2));

          const newPoint = { epoch: next, accuracy, loss, precision, recall };
          setHistory(currentHistory => [...currentHistory, newPoint]);

          if (next === totalEpochs) {
            setIsRunning(false);
            setShowFinal(true);
          }
          return next;
        });
      }, 1500); // 1.5 seconds per epoch
    }
    return () => clearInterval(timer);
  }, [isRunning, currentEpoch]);

  const currentMetrics = history.length > 0 ? history[history.length - 1] : {
    epoch: 0,
    accuracy: 0,
    loss: 0,
    precision: 0,
    recall: 0
  };

  return (
    <div className="p-10 rounded-[3.5rem] bg-slate-900 border border-white/5 space-y-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-3">
            <Brain size={28} className="text-blue-500" /> Epoch Training Simulation
          </h3>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
            Simulated real-time model optimization across federated nodes
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={resetSimulation}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={startSimulation}
            disabled={isRunning}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
              isRunning 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Training...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> {currentEpoch >= totalEpochs ? 'Retrain Model' : 'Start Simulation'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Metrics & Progress */}
        <div className="lg:col-span-4 space-y-8">
          {/* Progress Card */}
          <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</div>
                <div className="text-2xl font-black text-white">
                  {currentEpoch === 0 ? 'READY' : currentEpoch < totalEpochs ? 'ACTIVE' : 'COMPLETED'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Epoch</div>
                <div className="text-4xl font-black text-blue-500 tracking-tighter">
                  {currentEpoch}<span className="text-slate-700 text-xl">/{totalEpochs}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Overall Progress</span>
                <span className="text-white">{Math.round((currentEpoch/totalEpochs) * 100)}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentEpoch/totalEpochs) * 100}%` }}
                  transition={{ type: 'spring', damping: 20 }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Metrics List */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Accuracy', val: `${currentMetrics.accuracy}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Loss', val: currentMetrics.loss, icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10' },
              { label: 'Precision', val: `${currentMetrics.precision}%`, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Recall', val: `${currentMetrics.recall}%`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
            ].map((m, i) => (
              <motion.div 
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center mb-4`}>
                  <m.icon size={20} />
                </div>
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{m.label}</div>
                <div className="text-xl font-black text-white">{m.val}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Visualization Chart */}
        <div className="lg:col-span-8 p-8 rounded-[3rem] bg-black/20 border border-white/5 relative flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> Performance Curve
            </h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Loss</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="epoch" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="900" 
                  tickLine={false}
                  axisLine={false}
                  domain={[1, 10]}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="900" 
                  tickLine={false}
                  axisLine={false}
                  domain={[40, 100]}
                  hide
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    color: '#fff'
                  }} 
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAcc)" 
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="#f87171" 
                  strokeWidth={2} 
                  dot={false}
                  yAxisId={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <AnimatePresence>
            {showFinal && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-white uppercase tracking-tight">Optimization Success</h5>
                    <p className="text-xs font-medium text-slate-400">Model converged at {currentMetrics.accuracy}% accuracy after {totalEpochs} epochs.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white tracking-tighter">+{Math.round(currentMetrics.accuracy - 58)}%</div>
                  <div className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Gain Delta</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Epoch Step Indicators */}
      <div className="flex justify-between gap-2 relative z-10">
        {Array.from({ length: totalEpochs }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i + 1 <= currentEpoch 
                ? 'bg-blue-500' 
                : 'bg-white/10'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default TrainingSimulation;
