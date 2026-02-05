
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LifeValue, DailyAction } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { Send, BrainCircuit, User, Bot, Loader2 } from 'lucide-react';

interface Props {
  history: ChatMessage[];
  onNewMessage: (msg: ChatMessage) => void;
  values: LifeValue[];
  actions: DailyAction[];
}

const ValueChat: React.FC<Props> = ({ history, onNewMessage, values, actions }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input.trim() };
    onNewMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage([...history, userMsg], userMsg.text, values, actions);
      onNewMessage({ role: 'model', text: response });
    } catch (err) {
      onNewMessage({ role: 'model', text: "Извините, произошла ошибка соединения." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] max-w-2xl mx-auto bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 flex items-center gap-4 border-b border-white/5">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
          <BrainCircuit className="w-7 h-7 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-black tracking-tighter uppercase">ACT Mentor</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Online
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {history.length === 0 && (
          <div className="text-center py-12 opacity-50">
            <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-slate-200" />
            <p className="text-sm font-medium text-slate-400 italic">Спросите ментора о ваших ценностях или как преодолеть трудности дня.</p>
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-slate-400" />}
              </div>
              <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
                <div className="px-5 py-3.5 bg-slate-50 rounded-3xl text-slate-400 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-50 bg-slate-50/30">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Задайте вопрос..."
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-inner focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ValueChat;
