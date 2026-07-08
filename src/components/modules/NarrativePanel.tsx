import { useRef, useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Send, History, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NarrativeMessage } from '@/types';

function MessageBubble({ message }: { message: NarrativeMessage }) {
  const isScene = message.type === 'scene';
  const isDialogue = message.type === 'dialogue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-3 ${isScene ? 'flex justify-center' : 'flex justify-start'}`}
    >
      {isScene && (
        <div className="max-w-[90%] text-center">
          <p className="text-base leading-relaxed text-text-primary/90">{message.content}</p>
          <span className="text-[10px] text-text-muted mt-1 block">{message.timestamp}</span>
        </div>
      )}

      {isDialogue && (
        <div className="w-full max-w-[92%] flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-amber/30 to-accent-sunset/30 border-[5px] border-white shadow-md flex items-center justify-center shrink-0"
          >
            {message.avatar ? (
              <span className="text-xl font-bold text-text-primary">{message.avatar.slice(0, 1).toUpperCase()}</span>
            ) : (
              <User className="w-8 h-8 text-text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {message.speaker && (
              <span className="text-base font-bold text-accent-sunset block mb-1">{message.speaker}</span>
            )}
            <div className="inline-block px-5 py-3 rounded-2xl bg-bg-card-raised border border-border-soft shadow-sm"
            >
              <p className="text-base leading-snug text-text-primary">{message.content}</p>
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">{message.timestamp}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function NarrativePanel() {
  const { state, setNarrativeInput, sendNarrativeMessage, openOverlayView } = useGame();
  const { messages, inputText } = state.narrative;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendNarrativeMessage(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <GlassCard variant="raised" className="h-full flex flex-col overflow-hidden rounded-none border-0 bg-transparent">
      {/* 消息区 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
      </div>

      {/* 输入区 */}
      <div className="px-5 py-3 border-t border-border-soft bg-white/30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openOverlayView('history')}
            className="w-10 h-10 rounded-full bg-bg-glass hover:bg-white/60 flex items-center justify-center text-text-secondary transition-colors"
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
            className="flex-1 rounded-full bg-bg-glass border border-border-soft px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-sunset/30"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-accent-sunset text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-sunset/90 transition-colors"
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
