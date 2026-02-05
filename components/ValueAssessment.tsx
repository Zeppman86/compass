
import React, { useState } from 'react';
import { INITIAL_VALUE_TEMPLATES } from '../constants';
import { LifeValue } from '../types';
import { ChevronRight, ChevronLeft, CheckCircle2, Plus, Trash2, Info, HelpCircle, Sparkles, Target, Lightbulb, Compass, Star, Library } from 'lucide-react';

interface Props {
  onComplete: (values: LifeValue[]) => void;
}

const ValueAssessment: React.FC<Props> = ({ onComplete }) => {
  const [setupMode, setSetupMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Start with an empty selection to encourage conscious choice
  const [activeValues, setActiveValues] = useState<Omit<LifeValue, 'importance'>[]>([]);
  
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const togglePresetValue = (template: typeof INITIAL_VALUE_TEMPLATES[0]) => {
    const exists = activeValues.find(v => v.id === template.id);
    if (exists) {
      setActiveValues(prev => prev.filter(v => v.id !== template.id));
    } else {
      setActiveValues(prev => [...prev, { 
        id: template.id, 
        name: template.name, 
        description: template.description 
      }]);
    }
  };

  const removeValue = (id: string) => {
    setActiveValues(prev => prev.filter(v => v.id !== id));
  };

  const addCustomValue = () => {
    if (!customName.trim()) return;
    const newId = `custom-${Date.now()}`;
    setActiveValues(prev => [...prev, {
      id: newId,
      name: customName.trim(),
      description: customDesc.trim() || 'Ваша персональная ценность.'
    }]);
    setCustomName('');
    setCustomDesc('');
    setIsAddingCustom(false);
  };

  // handleScoreChange updates the importance score for a specific life value in the component state.
  const handleScoreChange = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const startScoring = () => {
    if (activeValues.length === 0) {
      alert("Пожалуйста, выберите хотя бы одну ценность для оценки.");
      return;
    }
    const newScores = { ...scores };
    activeValues.forEach(v => {
      if (newScores[v.id] === undefined) {
        newScores[v.id] = 5;
      }
    });
    setScores(newScores);
    setSetupMode(false);
  };

  const nextStep = () => {
    if (currentStep < activeValues.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const finalValues: LifeValue[] = activeValues.map(v => ({
        ...v,
        importance: scores[v.id] ?? 5
      }));
      onComplete(finalValues);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const getValueIcon = (id: string) => {
    const template = INITIAL_VALUE_TEMPLATES.find(t => t.id === id);
    return template ? template.icon : <Target className="w-5 h-5" />;
  };

  if (setupMode) {
    return (
      <div className="max-w-3xl w-full mx-auto p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 animate-in fade-in duration-500">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Выберите свои ценности</h2>
          <p className="text-slate-400 text-sm font-medium">Отметьте сферы, которые важны для вас сейчас, или добавьте свои.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LIBRARY SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Library className="w-5 h-5 text-indigo-500" />
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Рекомендуемые сферы</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {INITIAL_VALUE_TEMPLATES.map((template) => {
                const isSelected = activeValues.some(v => v.id === template.id);
                return (
                  <button
                    key={template.id}
                    onClick={() => togglePresetValue(template)}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 text-center group relative ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' 
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-indigo-500 shadow-sm border border-slate-100 group-hover:bg-indigo-50'
                    }`}>
                      {template.icon}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight leading-none">{template.name}</span>
                    
                    {/* Tooltip on Hover for Library Items */}
                    {!isSelected && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded-2xl flex items-center justify-center p-3 z-10 pointer-events-none">
                        <p className="text-[9px] text-slate-500 leading-tight font-bold italic">{template.description}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED & CUSTOM SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ваш список ({activeValues.length})</h3>
              </div>
              {activeValues.length > 0 && (
                <button onClick={() => setActiveValues([])} className="text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600">Очистить</button>
              )}
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {activeValues.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      {getValueIcon(v.id)}
                    </div>
                    <span className="text-sm font-bold text-slate-800 truncate">{v.name}</span>
                  </div>
                  <button onClick={() => removeValue(v.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {activeValues.length === 0 && (
                <div className="py-12 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-8">Выберите ценности из списка слева или впишите свою</p>
                </div>
              )}
            </div>

            {/* Custom Entry Form */}
            {isAddingCustom ? (
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Название ценности..." 
                  className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold outline-none"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={addCustomValue} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Добавить</button>
                  <button onClick={() => setIsAddingCustom(false)} className="px-4 py-3 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">Отмена</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingCustom(true)}
                className="w-full py-4 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center gap-3 text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Вписать свою сферу
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <button 
            onClick={startScoring}
            disabled={activeValues.length === 0}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale"
          >
            Перейти к оценке важности ({activeValues.length})
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  const currentItem = activeValues[currentStep];
  const currentScore = scores[currentItem.id] ?? 5;

  return (
    <div className="max-w-xl w-full mx-auto p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 animate-in slide-in-from-right-4 duration-500">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Этап {currentStep + 1} из {activeValues.length}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(((currentStep + 1) / activeValues.length) * 100)}% Завершено</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
            style={{ width: `${((currentStep + 1) / activeValues.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-12">
        <div className="flex flex-col items-center gap-4 mb-6 group">
           <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-indigo-100 group-hover:border-indigo-500">
             {React.cloneElement(getValueIcon(currentItem.id) as React.ReactElement, { className: "w-10 h-10" })}
           </div>
           
           <div className="flex items-center gap-3 relative group/tooltip">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{currentItem.name}</h2>
              <div className="p-1.5 hover:bg-indigo-50 rounded-xl transition-colors cursor-help">
                <HelpCircle className="w-6 h-6 text-slate-300 group-hover/tooltip:text-indigo-600 transition-colors" />
              </div>
              
              {/* ENHANCED INTERACTIVE TOOLTIP */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-80 p-0 bg-slate-900 text-white rounded-[2rem] opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-[70] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] scale-90 group-hover/tooltip:scale-100 origin-bottom border border-white/10 overflow-hidden">
                <div className="bg-indigo-600 p-5 flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-indigo-100 shrink-0" />
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-white">Гид по оценке: {currentItem.name}</h4>
                    <p className="text-[10px] text-indigo-100 opacity-80">Как выбрать верный балл?</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-indigo-400 flex items-center gap-1.5">
                      <Compass className="w-3 h-3" />
                      Вопрос для размышления
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium bg-white/5 p-3 rounded-xl">
                      «Насколько для меня важно, чтобы эта сфера была наполнена смыслом, даже если сейчас это дается трудно?»
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-indigo-400">Шкала значимости</p>
                    
                    <div className="grid grid-cols-[36px_1fr] gap-3 items-start">
                      <div className="h-8 w-8 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center text-[10px] font-black border border-rose-500/30">1-3</div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        <span className="text-slate-100 font-bold block mb-0.5">Второстепенно</span>
                        Эта сфера не является приоритетом в текущий период вашей жизни.
                      </div>
                    </div>

                    <div className="grid grid-cols-[36px_1fr] gap-3 items-start">
                      <div className="h-8 w-8 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center text-[10px] font-black border border-amber-500/30">4-7</div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        <span className="text-slate-100 font-bold block mb-0.5">Значимо</span>
                        Область важна для баланса, вы хотите уделять ей регулярное внимание.
                      </div>
                    </div>

                    <div className="grid grid-cols-[36px_1fr] gap-3 items-start">
                      <div className="h-8 w-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-[10px] font-black border border-emerald-500/30">8-10</div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        <span className="text-slate-100 font-bold block mb-0.5">Фундаментально</span>
                        Критически важная сфера, без которой жизнь кажется лишенной основы.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 p-4 border-t border-white/5 text-center">
                  <div className="inline-flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Оценивайте честно — это ваш компас
                  </div>
                </div>
              </div>
           </div>
        </div>
        
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl text-slate-600 text-sm font-semibold mb-8 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-default max-w-[90%] mx-auto leading-relaxed relative overflow-hidden group/desc">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover/desc:w-2 transition-all"></div>
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          {currentItem.description}
        </div>

        <div className="flex flex-col items-center gap-8 bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-50 relative group">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none"></div>
          
          <div className="relative pointer-events-none">
            <div className={`text-8xl font-black tabular-nums tracking-tighter transition-all duration-500 transform group-hover:scale-110 ${currentScore >= 8 ? 'text-emerald-600' : currentScore >= 4 ? 'text-indigo-600' : 'text-slate-700'}`}>
              {currentScore}
            </div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-60">Баллов</div>
          </div>
          
          <div className="w-full space-y-6 relative z-10">
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={currentScore} 
              onChange={(e) => handleScoreChange(currentItem.id, parseInt(e.target.value, 10))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:h-4 transition-all"
            />

            <div className="flex justify-between w-full text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] px-2 pointer-events-none">
              <span className={currentScore <= 3 ? 'text-rose-500 scale-110 transition-all font-black' : ''}>Совсем не важно</span>
              <span className={currentScore >= 8 ? 'text-emerald-500 scale-110 transition-all font-black' : ''}>Жизненно необходимо</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-50">
        <button 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          Назад
        </button>
        <button 
          onClick={nextStep}
          className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-200 hover:scale-105 transition-all active:scale-95"
        >
          {currentStep === activeValues.length - 1 ? 'Начать путь' : 'Следующая сфера'}
          {currentStep === activeValues.length - 1 ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default ValueAssessment;
