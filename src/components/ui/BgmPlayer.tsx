import { Repeat, SkipBack, Pause, SkipForward, ListMusic } from 'lucide-react';
import { motion } from 'framer-motion';

interface BgmPlayerProps {
  coverUrl?: string;
  title?: string;
}

export function BgmPlayer({ coverUrl, title = '未播放歌曲' }: BgmPlayerProps) {
  const controls = [
    { icon: Repeat, label: '循环' },
    { icon: SkipBack, label: '上一首' },
    { icon: Pause, label: '暂停', active: true },
    { icon: SkipForward, label: '下一首' },
    { icon: ListMusic, label: '列表' },
  ];

  return (
    <div
      id="topbar-bgm-player"
      className="h-16 flex items-center gap-4 pl-4 pr-5 bg-bg-card-raised/95 border-l border-border-soft"
    >
      {/* 唱片 */}
      <div className="relative w-14 h-14 shrink-0">
        <motion.div
          className="w-full h-full rounded-full bg-[#1a1a1a] border-[3px] border-[#2a2a2a] shadow-lg flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-accent-amber overflow-hidden flex items-center justify-center bg-[#333]">
            {coverUrl ? (
              <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-white/60">封面</span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-black/20" />
        </motion.div>
        {/* 唱针 */}
        <div className="absolute -top-1 -right-1 w-6 h-6 pointer-events-none">
          <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-white shadow" />
          <div className="absolute top-1 right-1 w-5 h-0.5 bg-white/80 origin-right rotate-[-30deg]" />
        </div>
      </div>

      {/* 歌曲名 */}
      <div className="min-w-0">
        <span className="block text-sm font-bold text-text-primary truncate">《{title}》</span>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-1.5">
        {controls.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              active
                ? 'bg-accent-sunset text-white shadow-md'
                : 'bg-bg-glass text-text-secondary hover:bg-white/60 hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
