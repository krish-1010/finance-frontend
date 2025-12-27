"use client";
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sliders, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PlannerPage() {
  const [salary, setSalary] = useState(30000);
  const [strategy, setStrategy] = useState('custom'); // '503020', 'debt', 'custom'
  
  // Percentages (Default to 50/30/20)
  const [allocations, setAllocations] = useState({ needs: 50, wants: 30, savings: 20 });

  // Strategies Logic
  const applyStrategy = (type) => {
    setStrategy(type);
    if (type === '503020') setAllocations({ needs: 50, wants: 30, savings: 20 });
    if (type === 'debt') setAllocations({ needs: 60, wants: 10, savings: 30 }); // High savings for debt
    if (type === 'fire') setAllocations({ needs: 40, wants: 10, savings: 50 }); // Aggressive
  };

  const handleSliderChange = (key, val) => {
    setStrategy('custom');
    setAllocations(prev => ({ ...prev, [key]: parseInt(val) }));
  };

  // Calculations
  const results = [
    { name: 'Needs (Fixed)', value: (salary * allocations.needs) / 100, color: '#ef4444' }, // Red
    { name: 'Wants (Lifestyle)', value: (salary * allocations.wants) / 100, color: '#f59e0b' }, // Amber
    { name: 'Savings/Debt', value: (salary * allocations.savings) / 100, color: '#10b981' }, // Green
  ];

  const totalPercent = allocations.needs + allocations.wants + allocations.savings;

  return (
    <main className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="text-indigo-600"/> Income Allocator
        </h1>
        <p className="text-slate-500">Plan exactly where your salary goes before you spend it.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          
          {/* Salary Input */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Net Income</label>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={18}/>
              <input 
                type="number" 
                value={salary} 
                onChange={e => setSalary(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Strategy Presets */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quick Strategies</label>
            <div className="flex gap-2">
              {['503020', 'debt', 'fire'].map(s => (
                <button 
                  key={s}
                  onClick={() => applyStrategy(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize ${strategy === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {s === '503020' ? 'Balanced (50/30/20)' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-4 border-t">
            {Object.keys(allocations).map(key => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-slate-700">{key}</span>
                  <span className="font-mono">{allocations[key]}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={allocations[key]} 
                  onChange={e => handleSliderChange(key, e.target.value)}
                  className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${key === 'needs' ? 'red' : key === 'wants' ? 'amber' : 'emerald'}-500`}
                />
              </div>
            ))}
            
            {/* Validation Warning */}
            {totalPercent !== 100 && (
              <div className="text-red-500 text-xs font-bold text-center animate-pulse">
                Total must be 100% (Current: {totalPercent}%)
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Visuals */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={results}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {results.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold">{formatCurrency(salary)}</span>
                </div>
            </div>

            <div className="space-y-3 mt-4">
                {results.map(item => (
                    <div key={item.name} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-sm font-medium text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-lg font-bold">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}