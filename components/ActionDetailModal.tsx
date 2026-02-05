
import React from 'react';
import { DailyAction, LifeValue, Mood } from '../types';
import { INITIAL_VALUE_TEMPLATES } from '../constants';
import { X, Calendar, Clock, Sparkles, Smile, Frown, Meh, Laugh, HeartCrack, Activity, ChevronRight, Target } from 'lucide-react';

interface Props {
  action: DailyAction;
  values: LifeValue[];
  onClose: () => void;
}

const MOOD_DATA: Record<Mood, { icon: React.ReactNode; label: string; color: string }> = {
  terrible: { icon: <HeartCrack className="w-5 h-5" />, label: 'Ужасно', color: 'text-rose-600 bg-rose-50' },
  bad: { icon: <Frown className="w-5 h-5" />, label: 'Плохо', color: 'text-orange-600 bg-orange-50' },
  neutral: { icon: <Meh className="w-5 h-5" />, label: 'Нормально', color: 'text-slate-600 bg-slate-50' },
  good: { icon: <Smile className="w-5 h-5" />, label: 'Хорошо', color: 'text-emerald-600 bg-emerald-50' },
  great: { icon: <Laugh className="w-5 h-5" />, label: 'Отлично', color: 'text-indigo-600 bg-indigo-50' },
};

const ActionDetailModal: React.FC<Props> = ({ action, values, onClose }) => {
  const moodInfo = action.mood ? MOOD_DATA[action.mood] : MOOD_DATA.neutral;

  const getValueIcon = (valueId: string) => {
    const template = INITIAL_VALUE_TEMPLATES.find(t => t.id === valueId);
    return template ? template.icon : <Target className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-white/20">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Детали опыта</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Хроника осознанного выбора</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
            <X className="w-7 h-7 text-slate-300 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-10 flex-1 custom-scrollbar">
          {/* Main Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-indigo-500 rounded-full"></div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Суть события</div>
            </div>
            <div className="text-3xl font-black text-slate-900 leading-[1.1] tracking-tight break-words">
              {action.description}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Дата события
              </div>
              <div className="text-base font-bold text-slate-800">
                {new Date(action.timestamp).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <Clock className="w-3.5 h-3.5" />
                Время записи
              </div>
              <div className="text-base font-bold text-slate-800">
                {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Mood Section */}
          <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl shadow-sm ${moodInfo.color} animate-pulse-slow`}>
                {moodInfo.icon}
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Внутреннее состояние</div>
                <div className="text-lg font-black text-slate-800">{moodInfo.label}</div>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-indigo-200" />
          </div>

          {/* Values Impact Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-6 bg-emerald-500 rounded-full"></div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Влияние на компас ценностей
              </div>
            </div>
            <div className="grid gap-3">
              {action.impacts?.map((imp, idx) => {
                const value = values.find(v => v.id === imp.valueId);
                const isPositive = imp.impact > 0;
                return (
                  <div key={idx} className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:border-indigo-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {getValueIcon(imp.valueId)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{value?.name || 'Неизвестная ценность'}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Сфера жизни</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-2xl font-black tabular-nums ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? `+${imp.impact}` : imp.impact}
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Баллов</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionDetailModal;
