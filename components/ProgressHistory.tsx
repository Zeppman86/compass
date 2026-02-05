
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DailyAction, LifeValue } from '../types';
import { Info, TrendingUp, BarChart3, Layers } from 'lucide-react';

interface Props {
  actions: DailyAction[];
  values: LifeValue[];
  timeFrame: 'day' | 'week' | 'month' | 'year';
}

const VALUE_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', 
  '#ef4444', '#06b6d4', '#f97316', '#14b8a6', '#64748b'
];

const ProgressHistory: React.FC<Props> = ({ actions, values, timeFrame }) => {
  const [viewType, setViewType] = useState<'daily' | 'cumulative'>('daily');
  const [hiddenValues, setHiddenValues] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => {
    const dataMap: Record<string, Record<string, number>> = {};
    const now = new Date();
    
    let daysToShow = 7;
    if (timeFrame === 'day') daysToShow = 1;
    if (timeFrame === 'week') daysToShow = 7;
    if (timeFrame === 'month') daysToShow = 30;
    if (timeFrame === 'year') daysToShow = 365;

    // Initialize period
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      dataMap[dateStr] = {};
      values.forEach(v => {
        dataMap[dateStr][v.id] = 0;
      });
    }

    // Process actions
    actions.forEach(action => {
      const dateStr = new Date(action.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (dataMap[dateStr]) {
        action.impacts.forEach(imp => {
          if (dataMap[dateStr][imp.valueId] !== undefined) {
            dataMap[dateStr][imp.valueId] += imp.impact;
          }
        });
      }
    });

    let formattedData = Object.entries(dataMap)
      .map(([date, scores]) => ({ date, ...scores }))
      .reverse();

    if (viewType === 'cumulative') {
      const runningTotals: Record<string, number> = {};
      values.forEach(v => runningTotals[v.id] = 0);
      
      formattedData = formattedData.map(entry => {
        const newEntry = { ...entry };
        values.forEach(v => {
          runningTotals[v.id] += entry[v.id] as number;
          newEntry[v.id] = runningTotals[v.id];
        });
        return newEntry;
      });
    }

    return formattedData;
  }, [actions, values, timeFrame, viewType]);

  const toggleValue = (valueId: string) => {
    setHiddenValues(prev => {
      const next = new Set(prev);
      if (next.has(valueId)) next.delete(valueId);
      else next.add(valueId);
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl border border-white/10 min-w-[200px] animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[11px] font-bold text-slate-300">{entry.name}</span>
                </div>
                <span className={`text-xs font-black tabular-nums ${entry.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {entry.value > 0 ? `+${entry.value.toFixed(1)}` : entry.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Всего за день</span>
            <span className="text-sm font-black text-white">{total.toFixed(1)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Динамика осознанности
              <div className="relative group/tip">
                <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-[1.5rem] opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-50 font-medium normal-case tracking-normal shadow-2xl border border-white/10">
                  Этот график визуализирует "вес" ваших действий. 
                  <br/><br/>
                  <Layers className="inline w-3 h-3 mr-1 text-indigo-400" /> <b>Слои</b> показывают баланс между сферами.
                  <br/><br/>
                  <TrendingUp className="inline w-3 h-3 mr-1 text-emerald-400" /> <b>Накопление</b> отражает ваш долгосрочный вклад в себя.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
          <button 
            onClick={() => setViewType('daily')}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewType === 'daily' ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Наполнение
          </button>
          <button 
            onClick={() => setViewType('cumulative')}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewType === 'cumulative' ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Накопление
          </button>
        </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {values.map((v, i) => (
                <linearGradient key={`grad-${v.id}`} id={`color-${v.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={VALUE_COLORS[i % VALUE_COLORS.length]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={VALUE_COLORS[i % VALUE_COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              onClick={(e: any) => toggleValue(e.dataKey)}
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  {payload?.map((entry: any, index: number) => {
                    const isHidden = hiddenValues.has(entry.dataKey);
                    return (
                      <button 
                        key={index} 
                        onClick={() => toggleValue(entry.dataKey)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${isHidden ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-slate-100 text-slate-600 shadow-sm hover:border-indigo-100'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isHidden ? 'bg-slate-200' : ''}`} style={isHidden ? {} : { backgroundColor: entry.color }}></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">{entry.value}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {values.map((v, i) => (
              <Area 
                key={v.id}
                type="monotone" 
                dataKey={v.id} 
                name={v.name}
                stackId="1"
                stroke={VALUE_COLORS[i % VALUE_COLORS.length]} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#color-${v.id})`}
                hide={hiddenValues.has(v.id)}
                animationDuration={1500}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressHistory;
