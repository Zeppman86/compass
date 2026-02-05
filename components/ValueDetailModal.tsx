
import React from 'react';
import { LifeValue, DailyAction } from '../types';
import { X, Target, TrendingUp, History, Info } from 'lucide-react';

interface Props {
  value: LifeValue;
  actions: DailyAction[];
  onClose: () => void;
}

const ValueDetailModal: React.FC<Props> = ({ value, actions, onClose }) => {
  const valueActions = actions.filter(a => a.impacts.some(imp => imp.valueId === value.id));
  const totalImpact = valueActions.reduce((sum, a) => {
    const imp = a.impacts.find(i => i.valueId === value.id);
    return sum + (imp ? imp.impact : 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{value.name}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Детальный разбор</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Важность</div>
              <div className="text-4xl font-black text-indigo-600">{value.importance}<span className="text-lg opacity-40">/10</span></div>
            </div>
            <div className={`p-6 rounded-[2rem] border ${totalImpact >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${totalImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Наполнение</div>
              <div className={`text-4xl font-black ${totalImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalImpact > 0 ? `+${totalImpact}` : totalImpact}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <Info className="w-3.5 h-3.5" />
              Определение ценности
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed italic">{value.description}</p>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <History className="w-3.5 h-3.5" />
              История связанных действий
            </h4>
            
            <div className="space-y-2">
              {valueActions.length > 0 ? (
                valueActions.map(action => {
                  const imp = action.impacts.find(i => i.valueId === value.id);
                  return (
                    <div key={action.id} className="bg-white p-5 rounded-2xl border border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                      <div>
                        <div className="text-[14px] font-bold text-slate-800 mb-1">{action.description}</div>
                        <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                          {new Date(action.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`text-lg font-black tabular-nums ${imp && imp.impact > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {imp && imp.impact > 0 ? `+${imp.impact}` : imp?.impact}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em] border-2 border-dashed border-slate-100 rounded-[2rem]">
                  Действий пока не зафиксировано
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-50">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
          >
            Закрыть обзор
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueDetailModal;
