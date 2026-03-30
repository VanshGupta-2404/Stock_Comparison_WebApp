import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCompanies, getStockData, getSummary, compareStocks, getPrediction } from './api';
import { LayoutDashboard, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('INFY.NS');
  const [compareSymbol, setCompareSymbol] = useState<string>('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'compare'>('dashboard');
  const [daysFilter, setDaysFilter] = useState<number>(30);
  
  const [data, setData] = useState<any[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [comparisonStats, setComparisonStats] = useState<any>(null);

  useEffect(() => {
    getCompanies().then((symbols) => {
        setCompanies(symbols);
        if (symbols.length > 0) setSelectedSymbol(symbols[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (viewMode === 'dashboard' && selectedSymbol) {
      getStockData(selectedSymbol, daysFilter).then(setData).catch(console.error);
      getSummary(selectedSymbol).then(setSummary).catch(console.error);
      getPrediction(selectedSymbol).then(res => setPrediction(res.predicted_next_close)).catch(console.error);
    } else if (viewMode === 'compare' && selectedSymbol && compareSymbol) {
      getStockData(selectedSymbol, daysFilter).then(setData).catch(console.error);
      getStockData(compareSymbol, daysFilter).then(setCompareData).catch(console.error);
      compareStocks(selectedSymbol, compareSymbol).then(res => setComparisonStats(res.comparison)).catch(console.error);
    }
  }, [selectedSymbol, compareSymbol, viewMode, daysFilter]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-xl font-black bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 tracking-wide">
            <Activity className="text-blue-500" strokeWidth={3} /> STOCK INTEL
          </h1>
        </div>
        
        <div className="px-4 py-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Views</p>
          <button 
            onClick={() => { setViewMode('dashboard'); setCompareSymbol(''); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium ${viewMode === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => { setViewMode('compare'); if(!compareSymbol && companies.length > 1) setCompareSymbol(companies.find(c => c !== selectedSymbol) || ''); }}
            className={`flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl transition-all font-medium ${viewMode === 'compare' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'}`}
          >
            <Layers size={20} /> Compare
          </button>
        </div>

        <div className="px-4 py-2 flex-1 overflow-y-auto hidden md:block">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Companies</p>
          <div className="space-y-2">
            {companies.map(symbol => (
              <button
                key={symbol}
                onClick={() => {
                  if (viewMode === 'compare') {
                    if (selectedSymbol === symbol) return;
                    if (!selectedSymbol) setSelectedSymbol(symbol);
                    else setCompareSymbol(symbol);
                  } else {
                    setSelectedSymbol(symbol);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide
                  ${selectedSymbol === symbol ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/30' : 
                   compareSymbol === symbol ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/30' :
                   'text-slate-400 hover:bg-slate-700/40 hover:text-white bg-slate-800/30'}
                `}
              >
                {symbol} {selectedSymbol === symbol && viewMode === 'compare' && ' (Base)'} {compareSymbol === symbol && viewMode === 'compare' && ' (Vs)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto relative bg-slate-900">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

        <header className="h-24 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
          <h2 className="text-3xl font-extrabold flex items-center gap-4 tracking-tight">
            {viewMode === 'dashboard' ? (
                <>
                  <span className="text-white">{selectedSymbol || 'Select Symbol'}</span>
                  <span className="text-slate-500 font-medium">Market Overview</span>
                </>
            ) : (
                <>
                  <span className="text-blue-400">{selectedSymbol}</span> 
                  <span className="text-slate-600 text-2xl font-medium">vs</span> 
                  <span className="text-indigo-400">{compareSymbol || '...'}</span>
                </>
            )}
          </h2>
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 shadow-inner">
            {[30, 90, 365].map(d => (
              <button 
                key={d} 
                onClick={() => setDaysFilter(d)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${daysFilter === d ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                {d === 365 ? '1 Year' : `${d} Days`}
              </button>
            ))}
          </div>
        </header>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && summary && (
          <main className="p-10 space-y-10 max-w-[1600px] mx-auto w-full relative z-0">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Current Close" 
                value={`$${data[data.length-1]?.close?.toFixed(2) || '---'}`}
                subtitle={data.length > 1 ? `${(((data[data.length-1].close - data[data.length-2].close) / data[data.length-2].close) * 100).toFixed(2)}% Today` : '---'} 
                trend={data.length > 1 && data[data.length-1].close > data[data.length-2].close ? 'up' : 'down'}
                icon={<TrendingUp size={32} />} 
              />
              <MetricCard 
                title="52W High" 
                value={`$${summary.fifty_two_week_high.toFixed(2)}`}
                subtitle="Peak performance in 1 yr" 
                icon={<ArrowUpRight size={32} className="text-emerald-400" />} 
              />
              <MetricCard 
                title="52W Low" 
                value={`$${summary.fifty_two_week_low.toFixed(2)}`}
                subtitle="Lowest point in 1 yr" 
                icon={<ArrowDownRight size={32} className="text-rose-400" />} 
              />
              <MetricCard 
                title="AI Forecast (T+1)" 
                value={prediction ? `$${prediction.toFixed(2)}` : 'Loading...'} 
                subtitle="Linear regression projection"
                icon={<Activity size={32} className="text-purple-400" />} 
                trend={prediction && data.length > 0 ? (prediction > data[data.length-1].close ? 'up' : 'down') : undefined} 
              />
            </div>

            {/* Main Chart */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold tracking-tight text-slate-200">Price Action & Moving Average</h3>
                 <div className="flex gap-4 text-sm font-semibold">
                    <span className="flex items-center gap-2 text-slate-300"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Closing Price</span>
                    <span className="flex items-center gap-2 text-slate-300"><span className="w-3 h-3 rounded-full bg-amber-500"></span> 7-Day MA</span>
                 </div>
              </div>
              <div className="h-[480px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} tickMargin={16} minTickGap={40} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} tickFormatter={(v) => `$${v}`} tickMargin={16} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', padding: '16px' }}
                      itemStyle={{ color: '#e2e8f0', fontWeight: 600, padding: '4px 0' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    />
                    <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 4 }} name="Close Price" />
                    <Line type="monotone" dataKey="seven_day_ma" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="6 6" name="7-Day MA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </main>
        )}

        {/* Compare View */}
        {viewMode === 'compare' && (
          <main className="p-10 space-y-10 max-w-[1600px] mx-auto w-full relative z-0">
            {/* Dynamic Compare Header Options */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-800/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl">
               <div className="flex-1 w-full">
                 <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Base Asset</label>
                 <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} className="w-full bg-slate-900/80 border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none font-semibold text-lg">
                   {companies.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               <div className="text-3xl font-black text-slate-500 bg-slate-900/50 p-4 rounded-full border border-white/5 shadow-inner mt-6 md:mt-2">VS</div>
               <div className="flex-1 w-full">
                 <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Target Asset</label>
                 <select value={compareSymbol} onChange={e => setCompareSymbol(e.target.value)} className="w-full bg-slate-900/80 border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none font-semibold text-lg">
                   <option value="">-- Select Stock to Compare --</option>
                   {companies.filter(c => c !== selectedSymbol).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
            </div>

            {compareSymbol && comparisonStats && comparisonStats[selectedSymbol] && comparisonStats[compareSymbol] && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <h3 className="text-3xl font-black text-blue-400 mb-8 bg-blue-500/10 inline-block px-5 py-2 rounded-xl border border-blue-500/20">{selectedSymbol} Stats</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">Long-term Trend</span>
                        <span className={`font-black text-xl px-4 py-2 rounded-xl ${comparisonStats[selectedSymbol]?.trend === 'Upward' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {comparisonStats[selectedSymbol]?.trend}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">Volatility (StdDev)</span>
                        <span className="font-black text-2xl text-white">{(comparisonStats[selectedSymbol]?.volatility * 100).toFixed(2)}<span className="text-slate-500 text-lg">%</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                    <h3 className="text-3xl font-black text-indigo-400 mb-8 bg-indigo-500/10 inline-block px-5 py-2 rounded-xl border border-indigo-500/20">{compareSymbol} Stats</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">Long-term Trend</span>
                        <span className={`font-black text-xl px-4 py-2 rounded-xl ${comparisonStats[compareSymbol]?.trend === 'Upward' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {comparisonStats[compareSymbol]?.trend}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">Volatility (StdDev)</span>
                        <span className="font-black text-2xl text-white">{(comparisonStats[compareSymbol]?.volatility * 100).toFixed(2)}<span className="text-slate-500 text-lg">%</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Combined Chart */}
                <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl mt-8">
                  <h3 className="text-xl font-bold tracking-tight text-slate-200 mb-8 flex gap-4">
                     Performance Comparison (Normalized %)
                     <div className="flex gap-4 text-sm font-bold ml-auto">
                        <span className="flex items-center gap-2 text-blue-400"><span className="w-3 h-3 rounded-full bg-blue-500"></span> {selectedSymbol}</span>
                        <span className="flex items-center gap-2 text-indigo-400"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> {compareSymbol}</span>
                     </div>
                  </h3>
                  <div className="h-[480px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.4} vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} tickMargin={16} minTickGap={40} axisLine={false} tickLine={false} type="category" allowDuplicatedCategory={false} />
                        <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} tickFormatter={(v) => `${v}%`} tickMargin={16} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', padding: '16px' }}
                          itemStyle={{ fontWeight: 600, padding: '4px 0' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        />
                        <Line data={getNormalizedData(data)} type="monotone" dataKey="normalized" stroke="#3b82f6" strokeWidth={3} dot={false} name={selectedSymbol} activeDot={{ r: 8, stroke: '#0f172a', strokeWidth: 4 }} />
                        <Line data={getNormalizedData(compareData)} type="monotone" dataKey="normalized" stroke="#8b5cf6" strokeWidth={3} dot={false} name={compareSymbol} activeDot={{ r: 8, stroke: '#0f172a', strokeWidth: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

function getNormalizedData(stockData: any[]) {
  if (!stockData || stockData.length === 0) return [];
  const basePrice = stockData[0].close;
  return stockData.map(d => ({
    date: d.date,
    normalized: parseFloat((((d.close - basePrice) / basePrice) * 100).toFixed(2))
  }));
}

function MetricCard({ title, value, icon, trend, subtitle }: { title: string, value: string, icon: React.ReactNode, trend?: 'up' | 'down', subtitle?: string }) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
      <div className="absolute top-[-20px] right-[-20px] p-8 bg-slate-700/20 rounded-full opacity-60 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-300">
        {icon}
      </div>
      <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-3">{title}</p>
      <h3 className="text-4xl font-black flex items-center gap-3 text-white tracking-tight mb-2">
        {value}
        {trend === 'up' && <ArrowUpRight size={28} className="text-emerald-500" />}
        {trend === 'down' && <ArrowDownRight size={28} className="text-rose-500" />}
      </h3>
      {subtitle && <p className={`text-sm font-bold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-500'}`}>{subtitle}</p>}
    </div>
  );
}
