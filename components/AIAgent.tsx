
import React, { useState, useEffect } from 'react';
import { LifeValue, DailyAction, GeminiInsight, DailyMission } from '../types';
import { getValuesInsight } from '../services/geminiService';
import { BrainCircuit, Sparkles, TrendingUp, RefreshCw, Compass, Lightbulb, CheckCircle2, AlertCircle, Zap, Info, ArrowRight, Quote, MessageSquare } from 'lucide-react';

interface Props {
  values: LifeValue[];
  actions: DailyAction[];
  activeMission?: DailyMission;
  onAcceptMission: (mission: DailyMission) => void;
  onCompleteMission: (missionId: string) => void;
}

const AIAgent: React.FC<Props> = ({ values, actions, activeMission, onAcceptMission, onCompleteMission }) => {
  const [insight, setInsight] = useState<GeminiInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    if (actions.length === 0) return;
    setLoading(true);
    const result = await getValuesInsight(values, actions);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    if (actions.length > 0 && !insight) {
      fetchInsight();
    }
  }, [actions.length]);

  const handleAccept = () => {
    if (!insight?.ideaOfDay) return;
    const mission: DailyMission = {
      id: crypto.randomUUID(),
      title: insight.ideaOfDay.title,
      description: insight.ideaOfDay.description,
      valueId: insight.ideaOfDay.valueId,
      acceptedAt: Date.now(),
      completed: false
    };
    onAcceptMission(mission);
  };

  if (actions.length === 0) {
    return (
      <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 text-center animate-pulse">
        <Compass className="w-10 h-10 text-indigo-300 mx-auto mb-4" />
        <h4 className="font-bold text-indigo-900 mb-1">Ожидание первых данных</h4>
        <p className="text-indigo-600 text-xs">Запишите хотя бы одно действие, чтобы Компас ожил.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DAILY CHALLENGE / MISSION */}
      {activeMission ? (
        <div className={`p-6 rounded-3xl relative overflow-hidden group border-2 transition-all duration-500 hover:shadow-2xl ${activeMission.completed ? 'bg-emerald-50 border-emerald-200 scale-[1.02]' : 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200'}`}>
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
                <Sparkles className="w-3 h-3 animate-spin-slow" />
                Активный вызов
              </div>
              {activeMission.completed && (
                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-white/80 px-2 py-1 rounded-full shadow-sm">Выполнено!</span>
              )}
           </div>
           <h4 className="text-lg font-black mb-1 group-hover:translate-x-1 transition-transform">{activeMission.title}</h4>
           <p className={`text-sm mb-4 ${activeMission.completed ? 'text-emerald-800/70' : 'text-indigo-100/90'}`}>{activeMission.description}</p>
           {!activeMission.completed && (
             <button 
                onClick={() => onCompleteMission(activeMission.id)}
                className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.03]"
             >
               Отметить выполнение
               <CheckCircle2 className="w-4 h-4" />
             </button>
           )}
        </div>
      ) : insight?.ideaOfDay && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-amber-100 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute -top-4 -right-4 text-amber-200/50 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
            <Lightbulb size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3 h-3" />
              Идея дня
            </div>
            <h4 className="text-lg font-black text-amber-900 mb-1">{insight.ideaOfDay.title}</h4>
            <p className="text-sm text-amber-800/80 mb-4">{insight.ideaOfDay.description}</p>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/50 text-amber-900 text-[10px] font-bold rounded-full border border-amber-300">
                Ценность: {values.find(v => v.id === insight.ideaOfDay?.valueId)?.name || 'Баланс'}
              </div>
              <button 
                onClick={handleAccept}
                className="text-amber-900 font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-amber-200 rounded-xl hover:bg-amber-300 transition-all flex items-center gap-2"
              >
                Принять
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE INSIGHTS ENGINE */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-700">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BrainCircuit size={160} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-1">
                <BrainCircuit className="w-4 h-4 animate-pulse" />
                AI Mentor Insight
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase">Анализ Пути</h3>
            </div>
            <button 
              onClick={fetchInsight} 
              disabled={loading}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-50 active:scale-95 border border-white/10"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-24 bg-white/5 rounded-[2rem]"></div>
              <div className="h-40 bg-white/5 rounded-[2rem]"></div>
            </div>
          ) : insight ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Score Display */}
              <div className="flex items-center justify-center py-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner">
                <div className="text-center">
                  <div className="text-6xl font-black text-indigo-400 tabular-nums leading-none mb-2">{insight.alignmentScore}%</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Соответствие ценностям</div>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="relative p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 group overflow-hidden">
                <Quote className="absolute -top-2 -left-2 w-12 h-12 text-white/5 rotate-12" />
                <p className="text-indigo-50 text-base leading-relaxed italic font-medium relative z-10">
                  {insight.analysis}
                </p>
              </div>

              {/* Behavioral Patterns Discoveries */}
              {insight.patterns && insight.patterns.length > 0 && (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 px-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Обнаруженные паттерны</span>
                  </div>
                  <div className="grid gap-4">
                    {insight.patterns.map((p, i) => (
                      <div key={i} className={`p-6 rounded-[2.5rem] border transition-all duration-300 relative group overflow-hidden ${p.type === 'negative' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${p.type === 'negative' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {p.type === 'negative' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className={`font-black text-sm uppercase tracking-tight ${p.type === 'negative' ? 'text-rose-200' : 'text-emerald-200'}`}>
                                    {p.description}
                                </h4>
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Проявлено {p.count} раз</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mentor Guidance Bubble */}
                        <div className="mt-4 p-5 bg-black/30 rounded-3xl border border-white/5 relative">
                            <div className="absolute -top-2 left-6 w-3 h-3 bg-black/30 rotate-45 border-l border-t border-white/5"></div>
                            <div className="flex gap-3">
                                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    <span className="text-indigo-300 font-black uppercase text-[9px] block mb-1 tracking-widest">Совет ментора</span>
                                    {p.advice}
                                </p>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Вектор развития</span>
                </div>
                <div className="grid gap-3">
                  {insight.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-colors group">
                      <div className="w-8 h-8 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center shrink-0 font-black text-xs group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        {i+1}
                      </div>
                      <span className="text-slate-300 text-sm font-medium leading-snug group-hover:text-white transition-colors">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 opacity-20">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Нажмите для обновления анализа</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
