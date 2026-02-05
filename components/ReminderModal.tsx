
import React from 'react';
import { ReminderSettings } from '../types';
import { X, Bell, BellOff, Calendar, Clock, Play, Sparkles } from 'lucide-react';

interface Props {
  settings: ReminderSettings;
  onUpdate: (settings: ReminderSettings) => void;
  onClose: () => void;
}

const ReminderModal: React.FC<Props> = ({ settings, onUpdate, onClose }) => {
  const toggleEnabled = () => {
    onUpdate({ ...settings, enabled: !settings.enabled });
  };

  const handleFrequencyChange = (frequency: 'daily' | 'weekly') => {
    onUpdate({ ...settings, frequency });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...settings, time: e.target.value });
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Ваш браузер не поддерживает уведомления.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toggleEnabled();
    } else {
      alert("Пожалуйста, разрешите уведомления в настройках браузера.");
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Проверка Компаса", {
        body: "Это тестовое напоминание! Вы на верном пути к своим ценностям.",
        icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      });
    } else {
      alert("Сначала разрешите уведомления.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Напоминания</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <div className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1">Статус</div>
              <div className="text-xs text-slate-400 font-medium">Получать пуш-уведомления</div>
            </div>
            <button 
              onClick={settings.enabled ? toggleEnabled : requestPermission}
              className={`w-14 h-8 rounded-full transition-all relative ${settings.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className={`space-y-6 transition-all ${settings.enabled ? 'opacity-100' : 'opacity-30 pointer-events-none grayscale'}`}>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Частота
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleFrequencyChange('daily')} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${settings.frequency === 'daily' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>Ежедневно</button>
                <button onClick={() => handleFrequencyChange('weekly')} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${settings.frequency === 'weekly' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>Еженедельно</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="w-3 h-3" /> Время
              </label>
              <input type="time" value={settings.time} onChange={handleTimeChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-indigo-600 outline-none text-xl text-center" />
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/10 shadow-inner relative group overflow-hidden">
               <div className="absolute top-2 right-4 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Предпросмотр</div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Bell className="w-4 h-4 text-white" /></div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Компас Ценностей</div>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">«Пора свериться с вашим компасом! Какие действия сегодня приблизили вас к вашим ценностям?»</p>
            </div>
            
            <button 
              onClick={sendTestNotification}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> Проверить уведомление
            </button>
          </div>
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-50">
          <button onClick={onClose} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
