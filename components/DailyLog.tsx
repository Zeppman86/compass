
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LifeValue, DailyAction, ActionTemplate, ValueImpact, Mood } from '../types';
import { parseNaturalLanguageAction, parseAudioAction } from '../services/geminiService';
import { INITIAL_VALUE_TEMPLATES } from '../constants';
import { 
  Plus, X, Zap, Settings2, Sparkles, Loader2, Smile, Frown, Meh, Laugh, 
  HeartCrack, Mic, StopCircle, Info, Layers, CheckSquare, Square, 
  Trash2, PlusCircle, Target, Check, AlertCircle, TrendingUp, Search, Filter
} from 'lucide-react';

interface Props {
  values: LifeValue[];
  templates: ActionTemplate[];
  onAddAction: (action: DailyAction, templateId?: string) => void;
  onAddActions: (actions: DailyAction[]) => void;
  onOpenSettings: () => void;
}

const MOODS: { type: Mood; icon: React.ReactNode; color: string; label: string }[] = [
  { type: 'terrible', icon: <HeartCrack className="w-5 h-5" />, color: 'text-rose-600 bg-rose-50', label: 'Ужасно' },
  { type: 'bad', icon: <Frown className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50', label: 'Плохо' },
  { type: 'neutral', icon: <Meh className="w-5 h-5" />, color: 'text-slate-600 bg-slate-50', label: 'Нормально' },
  { type: 'good', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50', label: 'Хорошо' },
  { type: 'great', icon: <Laugh className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50', label: 'Отлично' },
];

const DailyLog: React.FC<Props> = ({ values, templates, onAddAction, onAddActions, onOpenSettings }) => {
  const [description, setDescription] = useState('');
  const [customImpacts, setCustomImpacts] = useState<ValueImpact[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
  const [showForm, setShowForm] = useState(false);
  
  const [smartInput, setSmartInput] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  
  // Filtering states
  const [activeValueFilter, setActiveValueFilter] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (showForm && customImpacts.length === 0 && values.length > 0) {
      setCustomImpacts([{ valueId: values[0].id, impact: 1 }]);
    }
  }, [showForm, values]);

  // Unified template filtering logic
  const filteredTemplates = useMemo(() => {
    let result = [...templates].sort((a, b) => b.usageCount - a.usageCount);

    // Filter by active value category
    if (activeValueFilter) {
      result = result.filter(t => t.impacts.some(imp => imp.valueId === activeValueFilter));
    }

    // Filter by search text (smartInput)
    if (smartInput.trim().length >= 2) {
      const query = smartInput.toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(query));
    }

    return result;
  }, [templates, activeValueFilter, smartInput]);

  const toggleBatchTemplate = (id: string) => {
    setSelectedTemplateIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTemplateClick = (template: ActionTemplate) => {
    if (isBatchMode) {
      toggleBatchTemplate(template.id);
      return;
    }
    const newAction: DailyAction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description: template.description,
      impacts: template.impacts,
      mood: selectedMood
    };
    onAddAction(newAction, template.id);
    setSmartInput(''); // Clear input after quick select
  };

  const commitBatchLog = () => {
    const batchActions: DailyAction[] = [];
    selectedTemplateIds.forEach(id => {
      const template = templates.find(t => t.id === id);
      if (template) {
        batchActions.push({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: template.description,
          impacts: template.impacts,
          mood: selectedMood
        });
      }
    });
    onAddActions(batchActions);
    setSelectedTemplateIds(new Set());
    setIsBatchMode(false);
    setSmartInput('');
  };

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim() || isSmartLoading) return;
    setIsSmartLoading(true);
    try {
      const result = await parseNaturalLanguageAction(smartInput, values);
      const newActions: DailyAction[] = result.actions.map(act => ({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: act.description,
        impacts: act.impacts,
        mood: selectedMood
      }));
      onAddActions(newActions);
      setSmartInput('');
    } catch (err) {
      alert("Не удалось распознать. Попробуйте ручной ввод.");
    } finally {
      setIsSmartLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (event) => audioChunks.current.push(event.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          setIsSmartLoading(true);
          try {
            const result = await parseAudioAction(base64String, 'audio/webm', values);
            const newActions: DailyAction[] = result.actions.map(act => ({
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              description: act.description,
              impacts: act.impacts,
              mood: selectedMood
            }));
            onAddActions(newActions);
          } catch (e) {
            alert("Ошибка голосового ввода.");
          } finally {
            setIsSmartLoading(false);
          }
        };
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Доступ к микрофону запрещен.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || customImpacts.length === 0) return;
    const newAction: DailyAction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description: description.trim(),
      impacts: customImpacts,
      mood: selectedMood
    };
    onAddAction(newAction);
    setDescription('');
    setCustomImpacts([]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Mood Selector Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between px-2">
          {MOODS.map(m => (
            <button 
              key={m.type} 
              onClick={() => setSelectedMood(m.type)} 
              className={`p-3 rounded-2xl transition-all ${selectedMood === m.type ? `${m.color} ring-4 ring-indigo-500/10 scale-110` : 'text-slate-300 grayscale hover:grayscale-0'}`}
              title={m.label}
            >
              {m.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Input Bar */}
      <div className="relative group">
        <form onSubmit={handleSmartSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Что вы сделали?" 
              value={smartInput} 
              onChange={e => setSmartInput(e.target.value)} 
              className="w-full pl-12 pr-12 py-5 bg-white border-2 border-indigo-50 rounded-[2rem] shadow-sm focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" 
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-200" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isSmartLoading ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-100" />}
            </div>
          </div>
          <button 
            type="button" 
            onMouseDown={startRecording} 
            onMouseUp={stopRecording} 
            onTouchStart={startRecording} 
            onTouchEnd={stopRecording} 
            className={`p-5 rounded-[2rem] transition-all ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'} text-white shadow-xl shadow-indigo-100 active:scale-95`}
          >
            {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </form>
      </div>

      {/* Value Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
        <button 
          onClick={() => setActiveValueFilter(null)}
          className={`flex-none px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${!activeValueFilter ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
        >
          Все
        </button>
        {INITIAL_VALUE_TEMPLATES.map(val => (
          <button 
            key={val.id}
            onClick={() => setActiveValueFilter(val.id === activeValueFilter ? null : val.id)}
            className={`flex-none flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeValueFilter === val.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            {React.cloneElement(val.icon as React.ReactElement, { className: "w-3 h-3" })}
            {val.name}
          </button>
        ))}
      </div>

      {/* Quick Access Templates Area */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-black text-slate-400 flex items-center gap-2 text-[11px] uppercase tracking-widest">
            <Zap className="w-4 h-4 text-amber-500" /> 
            {smartInput.length >= 2 ? 'Найдено соответствий' : 'Быстрый ввод'}
          </h3>
          <button onClick={() => setIsBatchMode(!isBatchMode)} className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isBatchMode ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-100'}`}>
            <Layers className="w-4 h-4" /> 
            <span>{isBatchMode ? 'Пакетный ввод' : 'Пакет'}</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => {
              const mainImpact = template.impacts[0]?.impact || 0;
              const isPositive = mainImpact > 0;
              const isNegative = mainImpact < 0;

              return (
                <button 
                  key={template.id} 
                  onClick={() => handleTemplateClick(template)} 
                  className={`px-5 py-3 border rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 ${
                    selectedTemplateIds.has(template.id) 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : `bg-white border-slate-100 text-slate-700 hover:shadow-md hover:-translate-y-0.5 ${isPositive ? 'hover:border-emerald-200 hover:bg-emerald-50/30' : isNegative ? 'hover:border-rose-200 hover:bg-rose-50/30' : 'hover:border-indigo-100 hover:bg-indigo-50/30'}`
                  }`}
                >
                  {isBatchMode && (selectedTemplateIds.has(template.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-30" />)}
                  {template.description}
                  <span className={`text-[10px] opacity-40 ml-1 ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : ''}`}>
                    {mainImpact > 0 ? `+${mainImpact}` : mainImpact !== 0 ? mainImpact : ''}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="w-full py-8 text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-200" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ничего не найдено</p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
              >
                Создать вручную
              </button>
            </div>
          )}
          {!isBatchMode && (
            <button 
              onClick={() => setShowForm(true)} 
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-300 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
              title="Произвольная запись"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        {isBatchMode && selectedTemplateIds.size > 0 && (
          <button onClick={commitBatchLog} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl mt-6 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
            <Check className="w-5 h-5" /> Записать ({selectedTemplateIds.size})
          </button>
        )}
      </div>

      {/* Manual Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border border-indigo-50 animate-in slide-in-from-bottom-20 duration-500 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-slate-900 text-2xl tracking-tighter uppercase leading-none">Свободная запись</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Ручное управление ценностями</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Описание действия</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Например: Посетил врача" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 transition-all" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Влияние на ценности</label>
                  <button 
                    type="button" 
                    onClick={() => setCustomImpacts([...customImpacts, { valueId: values[0].id, impact: 1 }])}
                    className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Добавить
                  </button>
                </div>

                <div className="space-y-3">
                  {customImpacts.map((imp, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                      <select 
                        className="flex-1 bg-transparent border-none font-bold text-sm outline-none appearance-none cursor-pointer"
                        value={imp.valueId} 
                        onChange={e => {
                          const next = [...customImpacts];
                          next[idx].valueId = e.target.value;
                          setCustomImpacts(next);
                        }}
                      >
                        {values.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                         <input 
                            type="range" min="-5" max="5" step="0.5" 
                            value={imp.impact} 
                            onChange={e => {
                              const next = [...customImpacts];
                              next[idx].impact = parseFloat(e.target.value);
                              setCustomImpacts(next);
                            }}
                            className="w-20 accent-indigo-600"
                         />
                         <span className={`text-xs font-black min-w-[25px] tabular-nums ${imp.impact > 0 ? 'text-emerald-500' : imp.impact < 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                            {imp.impact > 0 ? `+${imp.impact}` : imp.impact}
                         </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setCustomImpacts(customImpacts.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 mt-auto">
              <button 
                type="submit" 
                disabled={!description.trim()}
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl hover:bg-indigo-700 uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
              >
                Сохранить запись
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DailyLog;
