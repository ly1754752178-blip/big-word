import { useRef, useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Send, History, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NarrativeMessage } from '@/types';

function MessageBubble({ message }: { message: NarrativeMessage }) {
  const { selectNarrativeOption } = useGame();
  const isScene = message.type === 'scene';
  const isDialogue = message.type === 'dialogue';
  const isOption = message.type === 'option';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 ${isScene ? 'flex justify-center' : isOption ? 'flex justify-center' : 'flex justify-start'}`}
    >
      {isScene && (
        <div className="max-w-[90%] text-center">
          <p className="text-sm leading-relaxed text-slate-600">{message.content}</p>
          <span className="text-[10px] text-slate-400 mt-1 block font-number">{message.timestamp}</span>
        </div>
      )}

      {isDialogue && (
        <div className="w-full max-w-[92%] flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-200 to-coral-300 border-2 border-white shadow-soft flex items-center justify-center shrink-0"
          >
            {message.speakerAvatar ? (
              <span className="text-base font-bold text-white">{message.speakerAvatar.slice(0, 1).toUpperCase()}</span>
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {message.speaker && (
              <span className="text-xs font-bold text-coral-400 block mb-1">{message.speaker}</span>
            )}
            <GlassCard variant="default" className="inline-block px-4 py-2.5">
              <p className="text-sm leading-snug text-slate-700">{message.content}</p>
            </GlassCard>
            <span className="text-[10px] text-slate-400 mt-1 block font-number">{message.timestamp}</span>
          </div>
        </div>
      )}

      {isOption && message.options && (
        <div className="w-full max-w-[92%]">
          <p className="text-center text-xs text-slate-500 mb-2">{message.content}</p>
          <div className="flex flex-col gap-2">
            {message.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectNarrativeOption(opt.id)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm hover:bg-sky-50 hover:border-sky-300 transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function NarrativePanel() {
  const { state, setNarrativeInput, sendNarrativeMessage, openOverlayView } = useGame();
  const { messages, inputText, isGenerating } = state.narrative;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    sendNarrativeMessage(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <GlassCard
      variant="default"
      className="h-full flex flex-col overflow-hidden rounded-none border-0 bg-transparent"
    >
      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse-soft" />
            <span>正在生成剧情……</span>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white/50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openOverlayView('history')}
            className="w-10 h-10 rounded-full bg-cream-50 hover:bg-white border border-cream-100 flex items-center justify-center text-slate-500 transition-colors"
            title="历史"
            aria-label="历史"
          >
            <History className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setNarrativeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你想说的话……"
            disabled={isGenerating}
            className="flex-1 rounded-full bg-cream-50 border border-cream-100 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-sky transition-all"
            title="发送"
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
