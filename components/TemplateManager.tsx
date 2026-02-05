
import React, { useState, useMemo } from 'react';
import { ActionTemplate, LifeValue, ValueImpact } from '../types';
import { X, Plus, Trash2, Edit2, Check, AlertCircle, PlusCircle, MinusCircle, Search, Zap, Info, Layers } from 'lucide-react';

interface Props {
  templates: ActionTemplate[];
  values: LifeValue[];
  onUpdate: (templates: ActionTemplate[]) => void;
  onClose: () => void;
}

const TemplateManager: React.FC<Props> = ({ templates, values, onUpdate, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editImpacts, setEditImpacts] = useState<ValueImpact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.description.toLowerCase().includes(query) ||
      t.impacts.some(imp => {
        const valName = values.find(v => v.id === imp.valueId)?.name || '';
        return valName.toLowerCase().includes(query);
      })
    );
  }, [templates, values, searchQuery]);

  const startEditing = (template: ActionTemplate) => {
    setEditingId(template.id);
    setEditDesc(template.description);
    setEditImpacts([...template.impacts]);
  };

  const startAdding = () => {
    setEditingId('new');
    setEditDesc('');
    setEditImpacts([{ valueId: values[0]?.id || '', impact: 1 }]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDesc('');
    setEditImpacts([]);
  };

  const addImpactRow = () => {
    setEditImpacts([...editImpacts, { valueId: values[0]?.id || '', impact: 1 }]);
  };

  const removeImpactRow = (index: number) => {
    if (editImpacts.length > 1) {
      setEditImpacts(editImpacts.filter((_, i) => i !== index));
    }
  };

  const updateImpactValueId = (index: number, valueId: string) => {
    const next = [...editImpacts];
    next[index].valueId = valueId;
    setEditImpacts(next);
  };

  const updateImpactWeight = (index: number, impact: number) => {
    const next = [...editImpacts];
    next[index].impact = impact;
    setEditImpacts(next);
  };

  const saveTemplate = () => {
    if (!editDesc.trim() || editImpacts.length === 0) return;

    if (editingId === 'new') {
      const next: ActionTemplate = {
        id: crypto.randomUUID(),
        description: editDesc,
        impacts: editImpacts,
        isCustom: true,
        usageCount: 0
      };
      onUpdate([...templates, next]);
    } else {
      onUpdate(templates.map(t => t.id === editingId ? {
        ...t,
        description: editDesc,
        impacts: editImpacts
      } : t));
    }
    cancelEditing();
  };

  const removeTemplate = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      onUpdate(templates.filter(t => t.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
              <Layers className="w-7 h-7 text-indigo-600" />
              Библиотека действий
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Персонализация ваших жизненных паттернов</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {!editingId && (
          <div className="px-8 pt-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Поиск по описанию или ценности..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        <div className="p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {editingId ? (
            <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  {editingId === 'new' ? 'Создать действие' : 'Редактировать'}
                </h3>
                <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Описание действия</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Например: Прогулка в лесу без телефона" 
                  className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-800"
                  value={editDesc} 
                  onChange={e => setEditDesc(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Влияние на ценности</label>
                  <button 
                    onClick={addImpactRow}
                    className="text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-indigo-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Добавить сферу
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editImpacts.map((imp, idx) => (
                    <div key={idx} className="flex gap-3 items-center group/impact animate-in fade-in slide-in-from-left-2 duration-200">
                      <select 
                        className="flex-1 px-4 py-3 bg-white border border-indigo-100 rounded-xl font-bold outline-none text-sm appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                        value={imp.valueId} 
                        onChange={e => updateImpactValueId(idx, e.target.value)}
                      >
                        {values.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <div className="flex items-center gap-3 bg-white border border-indigo-100 rounded-xl px-4 py-3 min-w-[160px]">
                        <span className={`text-[10px] font-black tabular-nums min-w-[30px] text-center ${imp.impact >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {imp.impact > 0 ? `+${imp.impact}` : imp.impact}
                        </span>
                        <input 
                          type="range" min="-5" max="5" step="0.5" 
                          value={imp.impact} 
                          onChange={e => updateImpactWeight(idx, parseFloat(e.target.value))}
                          className="w-20 accent-indigo-600 h-1.5 cursor-pointer"
                        />
                      </div>
                      <button 
                        onClick={() => removeImpactRow(idx)}
                        disabled={editImpacts.length <= 1}
                        className="p-3 text-slate-200 hover:text-rose-500 hover:bg-white rounded-xl transition-all disabled:opacity-0"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={saveTemplate}
                  disabled={!editDesc.trim()}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  Сохранить шаблон
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={startAdding}
                className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center gap-3 text-slate-400 font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                Создать новый шаблон
              </button>

              <div className="grid gap-4">
                {filteredTemplates.length > 0 ? (
                  [...filteredTemplates].sort((a, b) => b.usageCount - a.usageCount).map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                            {t.usageCount} исп.
                          </span>
                          {t.isCustom && <span className="text-[9px] font-black text-emerald-400 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Личный</span>}
                        </div>
                        <div className="text-base font-black text-slate-800 leading-tight mb-3 truncate">{t.description}</div>
                        <div className="flex flex-wrap gap-2">
                          {t.impacts.map((imp, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {values.find(v => v.id === imp.valueId)?.name || 'Ценность'}
                              </span>
                              <span className={`text-[10px] font-black tabular-nums ${imp.impact > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {imp.impact > 0 ? `+${imp.impact}` : imp.impact}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEditing(t)}
                          className="p-4 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                          title="Редактировать"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => removeTemplate(t.id)}
                          className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                          title="Удалить"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed">
                    <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Ничего не найдено</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            Закрыть менеджер
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
