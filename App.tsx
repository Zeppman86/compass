
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, LifeValue, DailyAction, ActionTemplate, ChatMessage, DailyMission, ReminderSettings } from './types';
import ValueAssessment from './components/ValueAssessment';
import RadarChartContainer from './components/RadarChartContainer';
import ProgressHistory from './components/ProgressHistory';
import DailyLog from './components/DailyLog';
import AIAgent from './components/AIAgent';
import TemplateManager from './components/TemplateManager';
import ValueChat from './components/ValueChat';
import ReminderModal from './components/ReminderModal';
import ValueDetailModal from './components/ValueDetailModal';
import ActionDetailModal from './components/ActionDetailModal';
import { DEFAULT_ACTION_TEMPLATES, MASTERY_SECRETS } from './constants';
import { LayoutDashboard, History, Trash2, Compass, Calendar, Search, MessageCircle, Info, Sparkles, Bell, TrendingUp, Map as MapIcon, ChevronRight, RefreshCw, CheckSquare, Square, XCircle, ArrowUp, ArrowDown, Settings, RotateCw, Filter, X, Undo2 } from 'lucide-react';

const STORAGE_KEY = 'act_values_app_state_v6';

type SortField = 'date' | 'impact' | 'value';
type SortOrder = 'asc' | 'desc';

const REMINDER_PHRASES = [
  "Пора свериться с вашим компасом! Какие действия сегодня приблизили вас к вашим ценностям?",
  "Минута осознанности: что из сделанного сегодня было по-настоящему важно для вас?",
  "Ценности — это путь, а не цель. Куда вы идете сегодня?",
  "Ваш Компас ждет. Зафиксируйте свои победы, даже самые маленькие."
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {
      values: [],
      actions: [],
      templates: DEFAULT_ACTION_TEMPLATES,
      isInitialized: false,
      chatHistory: [],
      reminderSettings: {
        enabled: false,
        frequency: 'daily',
        time: '20:00',
      }
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'chat'>('dashboard');
  const [dashboardView, setDashboardView] = useState<'map' | 'trend'>('map');
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [selectedValueId, setSelectedValueId] = useState<string | null>(null);
  const [selectedActionForDetail, setSelectedActionForDetail] = useState<DailyAction | null>(null);
  
  // Undo Batch State
  const [lastBatchIds, setLastBatchIds] = useState<string[] | null>(null);
  
  // History Search & Sort State
  const [historySearch, setHistorySearch] = useState('');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [historySortBy, setHistorySortBy] = useState<SortField>('date');
  const [historySortOrder, setHistorySortOrder] = useState<SortOrder>('desc');
  
  // Mastery Secrets State
  const [currentSecretIdx, setCurrentSecretIdx] = useState(() => Math.floor(Math.random() * MASTERY_SECRETS.length));
  const [secretAnim, setSecretAnim] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Reminder Logic - calendar aware
  useEffect(() => {
    const checkReminders = () => {
      if (!state.reminderSettings.enabled) return;

      const now = new Date();
      const [hours, minutes] = state.reminderSettings.time.split(':').map(Number);
      
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Check if it's past the time today
      if (now < scheduledTime) return;

      const lastNotified = state.reminderSettings.lastNotified || 0;
      const lastDate = new Date(lastNotified);
      const nowDate = new Date();
      
      // Determine if we should notify based on frequency
      let shouldNotify = false;
      if (state.reminderSettings.frequency === 'daily') {
        shouldNotify = nowDate.toDateString() !== lastDate.toDateString();
      } else {
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        shouldNotify = (now.getTime() - lastNotified) >= weekMs;
      }

      if (shouldNotify) {
        if ("Notification" in window && Notification.permission === "granted") {
          const phrase = REMINDER_PHRASES[Math.floor(Math.random() * REMINDER_PHRASES.length)];
          new Notification("Компас Ценностей", {
            body: phrase,
            icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          });
          
          setState(prev => ({
            ...prev,
            reminderSettings: {
              ...prev.reminderSettings,
              lastNotified: now.getTime()
            }
          }));
        }
      }
    };

    const intervalId = setInterval(checkReminders, 30000); 
    return () => clearInterval(intervalId);
  }, [state.reminderSettings]);

  const filteredAndSortedActions = useMemo(() => {
    let result = [...state.actions];
    if (historySearch.trim()) {
      const query = historySearch.toLowerCase();
      result = result.filter(a => 
        a.description.toLowerCase().includes(query) ||
        a.impacts.some(imp => {
          const v = state.values.find(val => val.id === imp.valueId);
          return v?.name.toLowerCase().includes(query);
        })
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (historySortBy === 'date') {
        comparison = (a.timestamp || 0) - (b.timestamp || 0);
      } else if (historySortBy === 'impact') {
        const sumA = a.impacts.reduce((acc, curr) => acc + curr.impact, 0);
        const sumB = b.impacts.reduce((acc, curr) => acc + curr.impact, 0);
        comparison = sumA - sumB;
      } else if (historySortBy === 'value') {
        const valA = state.values.find(v => v.id === a.impacts?.[0]?.valueId)?.name || '';
        const valB = state.values.find(v => v.id === b.impacts?.[0]?.valueId)?.name || '';
        comparison = valA.localeCompare(valB);
      }
      return historySortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [state.actions, state.values, historySortBy, historySortOrder, historySearch]);

  const dashboardFilteredActions = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    let threshold = 0;
    if (timeFrame === 'day') threshold = now - dayMs;
    else if (timeFrame === 'week') threshold = now - dayMs * 7;
    else if (timeFrame === 'month') threshold = now - dayMs * 30;
    else if (timeFrame === 'year') threshold = now - dayMs * 365;

    return state.actions.filter(a => a.timestamp >= threshold);
  }, [state.actions, timeFrame]);

  const handleAssessmentComplete = (values: LifeValue[]) => {
    setState({ ...state, values, isInitialized: true });
  };

  const handleAddAction = (action: DailyAction, templateId?: string) => {
    let newTemplates = state.templates;
    if (templateId) {
      newTemplates = state.templates.map(t => 
        t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
      );
    }
    setState({
      ...state,
      actions: [action, ...state.actions],
      templates: newTemplates
    });
    setLastBatchIds(null);
  };

  const handleAddActions = (newActions: DailyAction[]) => {
    const ids = newActions.map(a => a.id);
    setState(prev => ({
      ...prev,
      actions: [...newActions, ...prev.actions]
    }));
    
    setLastBatchIds(ids);
    
    setTimeout(() => {
      setLastBatchIds(current => (JSON.stringify(current) === JSON.stringify(ids)) ? null : current);
    }, 8000);
  };

  const handleUndoBatch = () => {
    if (!lastBatchIds) return;
    setState(prev => ({
      ...prev,
      actions: prev.actions.filter(a => !lastBatchIds.includes(a.id))
    }));
    setLastBatchIds(null);
  };

  const updateTemplates = (templates: ActionTemplate[]) => {
    setState({ ...state, templates });
  };

  const updateReminderSettings = (reminderSettings: ReminderSettings) => {
    setState({ ...state, reminderSettings });
  };

  const handleNewChatMessage = (msg: ChatMessage) => {
    setState({ ...state, chatHistory: [...state.chatHistory, msg] });
  };

  const handleAcceptMission = (mission: DailyMission) => {
    setState({ ...state, activeMission: mission });
  };

  const handleCompleteMission = (missionId: string) => {
    if (!state.activeMission || state.activeMission.id !== missionId) return;
    const mission = { ...state.activeMission, completed: true };
    
    const action: DailyAction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description: `Выполнил миссию: ${mission.title}`,
      impacts: [{ valueId: mission.valueId, impact: 4 }],
      mood: 'great'
    };
    
    setState({ 
      ...state, 
      activeMission: mission,
      actions: [action, ...state.actions]
    });
  };

  const deleteAction = (id: string) => {
    setState(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== id)
    }));
  };

  const deleteBulkActions = () => {
    if (confirm(`Удалить выбранные записи (${selectedHistoryIds.size})?`)) {
      setState(prev => ({
        ...prev,
        actions: prev.actions.filter(a => !selectedHistoryIds.has(a.id))
      }));
      setSelectedHistoryIds(new Set());
    }
  };

  const repeatBulkActions = () => {
    const actionsToRepeat = state.actions.filter(a => selectedHistoryIds.has(a.id));
    const newActions: DailyAction[] = actionsToRepeat.map(a => ({
      ...a,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      mood: 'neutral' 
    }));
    
    setState(prev => ({
      ...prev,
      actions: [...newActions, ...prev.actions]
    }));
    setSelectedHistoryIds(new Set());
    setActiveTab('dashboard');
  };

  const toggleSelectAction = (id: string) => {
    setSelectedHistoryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedHistoryIds.size === filteredAndSortedActions.length && filteredAndSortedActions.length > 0) {
      setSelectedHistoryIds(new Set());
    } else {
      setSelectedHistoryIds(new Set(filteredAndSortedActions.map(a => a.id)));
    }
  };

  const handleSortChange = (field: SortField) => {
    if (historySortBy === field) {
      setHistorySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setHistorySortBy(field);
      setHistorySortOrder('desc');
    }
  };

  const resetData = () => {
    if (confirm('Сбросить все данные?')) {
      const newState = {
        values: [],
        actions: [],
        templates: DEFAULT_ACTION_TEMPLATES,
        isInitialized: false,
        chatHistory: [],
        reminderSettings: {
          enabled: false,
          frequency: 'daily' as const,
          time: '20:00',
        }
      };
      setState(newState);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const nextSecret = () => {
    setSecretAnim(true);
    setTimeout(() => {
      setCurrentSecretIdx(prev => (prev + 1) % MASTERY_SECRETS.length);
      setSecretAnim(false);
    }, 300);
  };

  const selectedValue = useMemo(() => {
    return state.values.find(v => v.id === selectedValueId) || null;
  }, [selectedValueId, state.values]);

  if (!state.isInitialized) {
    return <ValueAssessment onComplete={handleAssessmentComplete} />;
  }

  const currentSecret = MASTERY_SECRETS[currentSecretIdx];

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-200 hover:rotate-12 transition-transform cursor-pointer">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase hidden sm:block">Компас</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="bg-slate-50 p-1.5 rounded-2xl flex border border-slate-100 scale-90 sm:scale-100">
               {(['day', 'week', 'month', 'year'] as const).map(tf => (
                 <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFrame === tf ? 'bg-white shadow-xl text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {tf === 'day' ? 'Д' : tf === 'week' ? 'Н' : tf === 'month' ? 'М' : 'Г'}
                 </button>
               ))}
             </div>
            <button 
              onClick={() => setShowReminderSettings(true)}
              className={`p-3 rounded-2xl transition-all relative ${state.reminderSettings.enabled ? 'text-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/10' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'}`}
              title="Напоминания"
            >
              <Bell className={`w-6 h-6 ${state.reminderSettings.enabled ? 'fill-indigo-600' : ''}`} />
              {state.reminderSettings.enabled && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"></span>
              )}
            </button>
            <button onClick={() => setShowTemplateManager(true)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all" title="Настройки шаблонов">
              <Settings className="w-6 h-6" />
            </button>
            <button onClick={resetData} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="Сброс данных">
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-12">
              <section className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group hover:shadow-indigo-100 transition-shadow duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-1000">
                  <Compass size={250} />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                     <button onClick={() => setDashboardView('map')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${dashboardView === 'map' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                       <MapIcon className="w-3.5 h-3.5" /> Карта
                     </button>
                     <button onClick={() => setDashboardView('trend')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${dashboardView === 'trend' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                       <TrendingUp className="w-3.5 h-3.5" /> Тренды
                     </button>
                   </div>
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">{dashboardView === 'map' ? 'Карта жизни' : 'Прогресс осознанности'}</h3>
                {dashboardView === 'map' ? <RadarChartContainer values={state.values} actions={dashboardFilteredActions} onValueClick={setSelectedValueId} /> : <ProgressHistory values={state.values} actions={state.actions} timeFrame={timeFrame} />}
              </section>

              <section className={`p-8 rounded-[3rem] border flex gap-6 items-center shadow-sm relative overflow-hidden transition-all duration-300 ${secretAnim ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'} ${currentSecret.color}`}>
                <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-lg">{currentSecret.icon}</div>
                <div className="flex-1 pr-12">
                   <h4 className="font-black text-sm uppercase tracking-widest mb-1 opacity-90">{currentSecret.title}</h4>
                   <p className="text-slate-700 text-sm leading-relaxed font-medium">{currentSecret.text}</p>
                </div>
                <button onClick={nextSecret} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/60 hover:bg-white rounded-2xl transition-all border border-white/40 shadow-sm active:scale-95"><RefreshCw className="w-5 h-5 opacity-60" /></button>
              </section>
              
              <DailyLog values={state.values} templates={state.templates} onAddAction={handleAddAction} onAddActions={handleAddActions} onOpenSettings={() => setShowTemplateManager(true)} />
            </div>

            <div className="lg:col-span-5 space-y-12">
              <AIAgent values={state.values} actions={state.actions} activeMission={state.activeMission} onAcceptMission={handleAcceptMission} onCompleteMission={handleCompleteMission} />
              
              <section className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg flex items-center gap-3"><History className="w-6 h-6 text-indigo-600" /> Последние записи</h3>
                  <button onClick={() => setActiveTab('history')} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Весь архив</button>
                </div>
                <div className="space-y-4">
                  {state.actions.slice(0, 5).map(action => (
                    <div key={action.id} onClick={() => setSelectedActionForDetail(action)} className="group relative bg-slate-50/50 p-5 rounded-3xl border border-slate-50 hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 pr-4">
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 opacity-60">{state.values.find(v => v.id === action.impacts?.[0]?.valueId)?.name || 'Ценность'}</div>
                          <div className="text-[15px] font-bold text-slate-800 leading-tight mb-2 truncate">{action.description}</div>
                          <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{new Date(action.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <div className={`text-lg font-black ${action.impacts?.[0]?.impact > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{action.impacts?.[0]?.impact > 0 ? `+${action.impacts[0].impact}` : action.impacts?.[0]?.impact}</div>
                      </div>
                    </div>
                  ))}
                  {state.actions.length === 0 && <p className="text-center text-slate-300 text-sm py-8">Пусто</p>}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'chat' && <ValueChat history={state.chatHistory} onNewMessage={handleNewChatMessage} values={state.values} actions={state.actions} />}

        {activeTab === 'history' && (
          <section className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                <div>
                  <div className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Хроника осознанности</div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">История опыта</h2>
                </div>
                <div className="w-full md:w-auto bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type="text" placeholder="Поиск..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
                  </div>
                  <div className="flex gap-2">
                    {(['date', 'impact', 'value'] as SortField[]).map(f => (
                      <button key={f} onClick={() => handleSortChange(f)} className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${historySortBy === f ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                        {f === 'date' ? 'Дата' : f === 'impact' ? 'Вес' : 'Сфера'}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
             <div className="grid gap-6">
              {filteredAndSortedActions.map(action => (
                <div 
                  key={action.id} 
                  onClick={() => setSelectedActionForDetail(action)} 
                  className={`bg-white p-8 rounded-[3rem] border flex flex-col md:flex-row justify-between items-center shadow-lg hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] transition-all group cursor-pointer relative gap-6 border-slate-50 hover:border-indigo-100 hover:-translate-y-1 active:scale-[0.99] ${selectedHistoryIds.has(action.id) ? 'ring-2 ring-indigo-500/20 bg-indigo-50/5' : ''}`}
                >
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <div onClick={(e) => { e.stopPropagation(); toggleSelectAction(action.id); }} className="relative z-10">
                      {selectedHistoryIds.has(action.id) ? <CheckSquare className="w-7 h-7 text-indigo-500" /> : <Square className="w-7 h-7 text-slate-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-60">{new Date(action.timestamp).toLocaleDateString()}</div>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{state.values.find(v => v.id === action.impacts?.[0]?.valueId)?.name || 'Ценность'}</div>
                      </div>
                      <div className="text-slate-900 font-black text-2xl leading-tight truncate group-hover:text-indigo-600 transition-colors">{action.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <div className={`text-3xl font-black tabular-nums ${action.impacts[0].impact > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {action.impacts[0].impact > 0 ? `+${action.impacts[0].impact}` : action.impacts[0].impact}
                      </div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Баллов</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); deleteAction(action.id); }} className="p-4 text-slate-100 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 relative z-10">
                          <Trash2 className="w-6 h-6" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
             </div>
          </section>
        )}
      </main>

      {lastBatchIds && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] md:w-80 z-[60] animate-in slide-in-from-bottom-8 duration-500">
           <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Undo2 className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold">Добавлено {lastBatchIds.length} записей</span>
              </div>
              <button onClick={handleUndoBatch} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all">Отменить</button>
           </div>
        </div>
      )}

      {showTemplateManager && <TemplateManager templates={state.templates} values={state.values} onUpdate={updateTemplates} onClose={() => setShowTemplateManager(false)} />}
      {showReminderSettings && <ReminderModal settings={state.reminderSettings} onUpdate={updateReminderSettings} onClose={() => setShowReminderSettings(false)} />}
      {selectedValue && <ValueDetailModal value={selectedValue} actions={state.actions} onClose={() => setSelectedValueId(null)} />}
      {selectedActionForDetail && <ActionDetailModal action={selectedActionForDetail} values={state.values} onClose={() => setSelectedActionForDetail(null)} />}

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-10 py-5 rounded-[3rem] shadow-2xl flex items-center gap-8 md:gap-12 z-50 border border-white/60">
        <button onClick={() => setActiveTab('dashboard')} className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-300' : 'group-hover:bg-slate-100'}`}><LayoutDashboard className="w-6 h-6" /></div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] mt-1 hidden md:block">Пульс</span>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'chat' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-300' : 'group-hover:bg-slate-100'}`}><MessageCircle className="w-6 h-6" /></div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] mt-1 hidden md:block">Ментор</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-300' : 'group-hover:bg-slate-100'}`}><History className="w-6 h-6" /></div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] mt-1 hidden md:block">Архив</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
