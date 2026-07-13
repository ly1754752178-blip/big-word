import { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGameState';
import { useSillytavern } from '@/hooks/useSillytavern';
import { GlassCard } from '@/components/ui/GlassCard';
import { Send, Wrench, X, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingPanel } from '@/components/modules/ThinkingPanel';
import { VariablePanel } from '@/components/SillyTavern/VariablePanel';
import { HistoryDrawer } from '@/components/SillyTavern/HistoryDrawer';
import { parseDialogueResponse, DEFAULT_AVATAR } from '@/lib/dialogue-parser';
import type { NarrativeMessage } from '@/types';

function MessageBubble({ message }: { message: NarrativeMessage }) {
  const { selectNarrativeOption } = useGame();
  const isScene = message.type === 'scene';
  const isDialogue = message.type === 'dialogue';
  const isOption = message.type === 'option';

  // 头像 URL + 回退
  const [avatarSrc, setAvatarSrc] = useState(
    message.speakerAvatar ?? DEFAULT_AVATAR
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-3 ${isScene ? 'flex justify-center' : isOption ? 'flex justify-center' : 'flex justify-start'}`}
    >
      {isScene && (
        <div className="max-w-[90%] text-center">
          <p className="text-base leading-relaxed text-slate-600">{message.content}</p>
        </div>
      )}

      {isDialogue && (
        <div className="w-full max-w-[92%] flex items-start gap-4">
          <div
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-coral-200 to-coral-300 flex items-center justify-center overflow-hidden shrink-0"
            style={{
              border: '3px solid #F04A3C',
              boxShadow: '0 0 0 3px rgba(240,74,60,0.12), 0 4px 16px rgba(240,74,60,0.18)',
            }}
          >
            {message.speakerAvatar ? (
              <img
                src={avatarSrc}
                alt={message.speaker ?? ''}
                className="w-full h-full object-cover"
                onError={() => setAvatarSrc(DEFAULT_AVATAR)}
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {(message.speaker ?? '?').slice(0, 1)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {message.speaker && (
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-sm shrink-0"
                  style={{ background: '#F04A3C', transform: 'rotate(45deg)' }}
                />
                <span
                  className="text-base font-extrabold tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #F04A3C 0%, #E87860 50%, #D4604A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {message.speaker}
                </span>
              </div>
            )}
            <div
              className="inline-block px-5 py-3.5 rounded-2xl relative"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(240,74,60,0.18)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <p className="text-[17px] leading-relaxed text-slate-700">{message.content}</p>
            </div>
          </div>
        </div>
      )}

      {isOption && message.options && (
        <div className="w-full max-w-[92%]">
          <p className="text-center text-sm text-slate-500 mb-2">{message.content}</p>
          <div className="flex flex-col gap-2">
            {message.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectNarrativeOption(opt.id)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-[15px] hover:bg-sky-50 hover:border-sky-300 transition-all"
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
  const { state, setNarrativeInput, sendNarrativeMessage, appendNarrativeMessage } = useGame();
  const st = useSillytavern();
  const { messages, inputText, isGenerating } = state.narrative;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 思考过程可见性
  const [thinkingVisible, setThinkingVisible] = useState(false);
  // 思考内容（从最后一次 AI 回复中提取）
  const [thinkingContent, setThinkingContent] = useState('');

  // 功能菜单
  const [showToolMenu, setShowToolMenu] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || isGenerating) return;
    const content = inputText.trim();
    // 先通过 sendNarrativeMessage 在 GameContext 中创建用户消息（同时触发 mock LLM）
    sendNarrativeMessage(content);
    // 再调用酒馆 API
    st.sendMessage(content).catch((err) => console.error('[Tavern] sendMessage failed:', err));
  }, [inputText, isGenerating, sendNarrativeMessage, st]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // 暴露 thinking toggle 给 SkyOrb（通过 window 事件）
  useEffect(() => {
    const handler = () => setThinkingVisible((v) => !v);
    window.addEventListener('toggle-thinking', handler);
    return () => window.removeEventListener('toggle-thinking', handler);
  }, []);

  // 监听酒馆消息变化，自动解析 AI 回复并追加到 GameContext
  const processedTavernMsgIdsRef = useRef(new Set<string>());

  useEffect(() => {
    const msgs = st.activeChat?.messages ?? [];
    if (msgs.length === 0) return;

    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant' || !lastMsg.content) return;

    // 避免重复处理
    if (processedTavernMsgIdsRef.current.has(lastMsg.id)) return;
    processedTavernMsgIdsRef.current.add(lastMsg.id);

    // 解析 AI 回复
    const parsed = parseDialogueResponse(lastMsg.content);

    // 提取 thinking 内容
    const thinking = parsed.find((p) => p.type === 'thinking');
    if (thinking) {
      setThinkingContent(thinking.content);
    }

    // 转换为 NarrativeMessage 并追加到 GameContext
    const now = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const baseId = lastMsg.id;

    parsed.forEach((p, i) => {
      if (p.type === 'thinking' || p.type === 'vars') return;

      let narrativeMsg: NarrativeMessage;

      if (p.type === 'dialogue') {
        narrativeMsg = {
          id: `st-${baseId}-${i}`,
          type: 'dialogue',
          content: p.content,
          speaker: p.speaker,
          speakerAvatar: p.speakerAvatar,
          timestamp: now,
        };
      } else if (p.type === 'option' && p.options) {
        narrativeMsg = {
          id: `st-${baseId}-${i}`,
          type: 'option',
          content: p.content,
          options: p.options.map((opt, j) => ({
            id: `opt-${baseId}-${j}`,
            label: opt,
          })),
          timestamp: now,
        };
      } else {
        narrativeMsg = {
          id: `st-${baseId}-${i}`,
          type: 'scene',
          content: p.content,
          timestamp: now,
        };
      }

      appendNarrativeMessage(narrativeMsg);
    });
  }, [st.activeChat?.messages, appendNarrativeMessage]);

  return (
    <GlassCard
      variant="default"
      className="h-full flex flex-col overflow-hidden rounded-none border-0 bg-transparent"
    >
      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-8 pb-4 scroll-smooth">
        {/* 思考面板 */}
        <ThinkingPanel content={thinkingContent} isVisible={thinkingVisible} />

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <span className="w-4 h-4 text-sky-400">✨</span>
            <span>正在生成剧情……</span>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="px-4 py-3 border-t border-[#E8DFD3] bg-[#FDFAF5]/95 relative">
        {/* 功能展开菜单 */}
        {showToolMenu && (
          <div className="absolute bottom-full left-4 mb-2 w-44 bg-white border border-[#E8DFD3] rounded-xl shadow-lg overflow-hidden z-20">
            <button
              onClick={() => { setShowVariables(true); setShowToolMenu(false); }}
              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-cream-50 flex items-center gap-3 border-b border-[#E8DFD3]"
            >
              <Eye size={14} /> 变量
            </button>
            <button
              onClick={() => { setShowHistory(true); setShowToolMenu(false); }}
              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-cream-50 flex items-center gap-3"
            >
              <Clock size={14} /> 历史楼层
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowToolMenu(!showToolMenu)}
            className="w-10 h-10 rounded-full bg-cream-50 hover:bg-white border border-cream-100 flex items-center justify-center text-slate-500 transition-colors"
            title="功能"
            aria-label="功能"
          >
            <Wrench className="w-4 h-4" />
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

      {/* 变量面板浮层 */}
      {showVariables && (
        <div className="modal-overlay" onClick={() => setShowVariables(false)}>
          <div className="modal modal--settings" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>变量管理</h2>
              <button onClick={() => setShowVariables(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <VariablePanel
                variables={st.activeChat?.variables ?? {}}
                onUpdate={st.updateVariables}
              />
            </div>
          </div>
        </div>
      )}

      {/* 历史楼层浮层 */}
      {showHistory && (
        <HistoryDrawer
          messages={st.activeChat?.messages ?? []}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </GlassCard>
  );
}
