import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NarrativeMessage } from '@/types';

function HistoryMessage({ message, index }: { message: NarrativeMessage; index: number }) {
  const isScene = message.type === 'scene';
  const isDialogue = message.type === 'dialogue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`mb-6 ${isScene ? 'flex justify-center' : 'flex justify-start'}`}
    >
      {isScene && (
        <div className="max-w-[85%] text-center">
          <div className="inline-block rounded-2xl bg-cream-50 border border-cream-100 px-6 py-4">
            <p className="text-base leading-relaxed text-slate-700">{message.content}</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">{message.timestamp}</span>
        </div>
      )}

      {isDialogue && (
        <div className="w-full max-w-[90%] flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-200 to-coral-300 border-4 border-white shadow-soft flex items-center justify-center shrink-0"
          >
            {message.speakerAvatar ? (
              <span className="text-lg font-bold text-white">{message.speakerAvatar.slice(0, 1).toUpperCase()}</span>
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {message.speaker && (
              <span className="text-sm font-bold text-coral-400 block mb-1">{message.speaker}</span>
            )}
            <GlassCard variant="default" className="inline-block px-5 py-3">
              <p className="text-base leading-relaxed text-slate-700">{message.content}</p>
            </GlassCard>
            <span className="text-[10px] text-slate-400 mt-1.5 block">{message.timestamp}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function HistoryOverlay() {
  const { state } = useGame();
  const { messages } = state.narrative;

  return (
    <div className="max-w-3xl mx-auto">
      <GlassCard variant="default" className="p-6 md:p-8 bg-cream-50 border-cream-100 min-h-[50vh]">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-500">暂无叙事历史</div>
        )}
        <div className="space-y-2">
          {messages.map((message, idx) => (
            <HistoryMessage key={message.id} message={message} index={idx} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
