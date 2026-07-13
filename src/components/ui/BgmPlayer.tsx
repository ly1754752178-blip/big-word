import { useState, useCallback, useRef, useEffect } from 'react';
import { Repeat, SkipBack, Pause, Play, SkipForward, ListMusic, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface Track {
  title: string;
  artist?: string;
  audioUrl: string;
  coverUrl: string;
}

interface BgmPlayerProps {
  playlist?: Track[];
}

const DEFAULT_PLAYLIST: Track[] = [
  {
    title: 'おしんこ',
    artist: '未知艺术家',
    audioUrl: '/bgm.mp3',
    coverUrl: '/cover.jpg',
  },
];

// 唱片纹理圆环尺寸（适配 52px 唱片）
const GROOVE_RINGS = [23, 26, 29, 32, 35, 38, 41, 44, 47];

export function BgmPlayer({ playlist = DEFAULT_PLAYLIST }: BgmPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // coverLoaded 仅用于错误处理(setCoverLoaded)，值本身暂未消费
  const [, setCoverLoaded] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentIndex] ?? playlist[0];
  const hasCover = Boolean(currentTrack?.coverUrl);

  // ── 初始化 audio 元素 ──
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.5;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (repeatMode === 'all') {
        handleNext();
      } else {
        setIsPlaying(false);
        audio.currentTime = 0;
      }
    };
    const onError = () => {
      setIsPlaying(false);
      setCoverLoaded(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 切换音轨时加载新音频 ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const wasPlaying = !audio.paused;
    audio.src = currentTrack.audioUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 音量变更 ──
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // ── 播放/暂停 ──
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // ── 上下首 ──
  const handlePrev = useCallback(() => {
    if (playlist.length <= 1) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); setIsPlaying(true); }
      return;
    }
    setCurrentIndex((v) => (v === 0 ? playlist.length - 1 : v - 1));
  }, [playlist.length]);

  const handleNext = useCallback(() => {
    if (playlist.length <= 1) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); setIsPlaying(true); }
      return;
    }
    setCurrentIndex((v) => (v === playlist.length - 1 ? 0 : v + 1));
  }, [playlist.length]);

  // ── 循环模式 ──
  const toggleRepeat = useCallback(() => {
    setRepeatMode((v) => (v === 'off' ? 'all' : v === 'all' ? 'one' : 'off'));
  }, []);

  // ── 格式化时间 ──
  const formatTime = (t: number) => {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── 进度条数据 ──
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const playedBars = Math.floor(progressRatio * 24);

  // ── 音量图标 ──
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.3 ? Volume1 : Volume2;

  const repeatColors: Record<string, string> = {
    off: 'text-white/30 hover:text-white/60',
    all: 'text-blue-400 hover:text-blue-300',
    one: 'text-blue-400 hover:text-blue-300',
  };

  // 共用斜边百分比
  const slantPct = '8%';

  return (
    <div
      id="topbar-bgm-player"
      className="h-16 flex items-center gap-3 pl-8 pr-4 relative overflow-hidden"
      style={{
        background: hasCover
          ? 'rgba(30,25,18,0.65)'
          : 'linear-gradient(135deg, rgba(238,228,198,0.96) 0%, rgba(228,218,185,0.94) 50%, rgba(218,208,173,0.96) 100%)',
        clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)`,
        filter: 'drop-shadow(-2px 0 6px rgba(0,0,0,0.06))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.08)',
      }}
    >
      {/* ── 毛玻璃封面背景 ── */}
      {hasCover && (
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)` }}>
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="absolute w-full h-full object-cover"
            style={{
              filter: 'blur(18px) brightness(0.5) saturate(1.3)',
              transform: 'scale(1.2)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(30,25,18,0.35)', backdropFilter: 'blur(4px)' }}
          />
        </div>
      )}

      {/* 斜边米白渐变高光 */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: '80px',
          background: hasCover
            ? 'linear-gradient(90deg, rgba(255,250,240,0.25) 0%, rgba(255,250,240,0.06) 40%, transparent 100%)'
            : 'linear-gradient(90deg, rgba(255,250,240,0.45) 0%, rgba(250,242,225,0.18) 35%, rgba(245,235,215,0.05) 65%, transparent 100%)',
          left: '0px',
        }}
      />

      {/* 背景暖光 */}
      <div
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none opacity-15"
        style={{
          background: hasCover
            ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,250,240,0.5) 0%, transparent 70%)',
        }}
      />

      {/* ── 唱片区域 52×52 ── */}
      <div className="relative w-[52px] h-[52px] shrink-0">
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center relative"
          style={{
            background: hasCover
              ? 'radial-gradient(circle at 50% 50%, rgba(20,15,10,0.6) 0%, rgba(10,8,5,0.8) 60%, rgba(15,12,8,0.75) 100%)'
              : 'radial-gradient(circle at 50% 50%, #e0d4b0 0%, #c8b888 60%, #d0c098 100%)',
            boxShadow: hasCover
              ? '0 3px 12px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 3px 12px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.04)',
          }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={isPlaying ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
        >
          {/* 唱片纹理 —— 同心圆轨道 */}
          {GROOVE_RINGS.map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                border: `0.5px solid ${hasCover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'}`,
                opacity: i % 3 === 0 ? 0.6 : 0.25,
              }}
            />
          ))}

          {/* 封面 / 占位 */}
          <div
            className="absolute rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: '33px',
              height: '33px',
              border: `1.5px solid ${hasCover ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
              background: hasCover ? '#111' : 'linear-gradient(135deg, #e8dcc0 0%, #d8c8a0 100%)',
            }}
          >
            {hasCover ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover rounded-full"
                onError={() => setCoverLoaded(false)}
              />
            ) : (
              <span className="text-[8px] text-[#5a4030]/35 tracking-wider font-number">LP</span>
            )}
          </div>

          {/* 中心蓝标 */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: '12px',
              height: '12px',
              background: 'linear-gradient(135deg, #5A9ED8 0%, #2563A0 100%)',
              boxShadow: '0 0 5px rgba(90,158,216,0.45)',
            }}
          >
            <div className="rounded-full" style={{ width: '3.5px', height: '3.5px', background: '#1a1a1a' }} />
          </div>
        </motion.div>

        {/* 唱针 */}
        <div className="absolute -top-1 -right-1 w-8 h-8 pointer-events-none">
          <div
            className="absolute top-0 right-0.5 w-2.5 h-2.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #e8e0d8 0%, #c0b8b0 40%, #a09890 100%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          />
          <div
            className="absolute top-2 right-1.5 w-7 h-[1.5px] origin-right"
            style={{
              transform: 'rotate(-32deg)',
              background: 'linear-gradient(90deg, rgba(192,184,176,0.9) 0%, rgba(160,152,144,0.95) 60%, rgba(200,194,188,0.7) 100%)',
              boxShadow: '0 0 2px rgba(0,0,0,0.3)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '2px', height: '2px',
              background: '#5A9ED8', top: '3px', left: '2.5px',
              boxShadow: '0 0 2px rgba(90,158,216,0.6)',
            }}
          />
        </div>
      </div>

      {/* ── 歌曲信息 + 进度条 + 音量 ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-[2px] relative z-[1]">
        {/* 歌名 */}
        <motion.span
          className="block text-[12px] font-bold truncate leading-tight"
          style={{ color: hasCover ? '#f0ead8' : '#4a3528' }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          《{currentTrack?.title ?? '未播放歌曲'}》
        </motion.span>

        {/* 波形进度条 */}
        <div className="flex items-center gap-1.5">
          <div className="w-[100px] flex items-end gap-[1px] h-2.5">
            {Array.from({ length: 24 }).map((_, i) => {
              const isPlayed = i < playedBars;
              const heights = [0.4, 0.7, 0.55, 0.85, 0.6, 0.9, 0.5, 0.75, 0.45, 0.8, 0.35, 0.65,
                0.5, 0.7, 0.4, 0.6, 0.3, 0.55, 0.45, 0.7, 0.35, 0.5, 0.4, 0.6];
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{
                    height: `${heights[i] * 100}%`,
                    background: isPlayed
                      ? 'linear-gradient(180deg, #6AADF0 0%, #3B7DC0 100%)'
                      : hasCover ? 'rgba(255,255,255,0.12)' : 'rgba(180,160,120,0.2)',
                    boxShadow: isPlayed ? '0 0 3px rgba(74,143,212,0.3)' : 'none',
                  }}
                />
              );
            })}
          </div>
          <span
            className="text-[8px] font-number shrink-0"
            style={{ color: hasCover ? 'rgba(255,255,255,0.35)' : 'rgba(90,64,48,0.3)' }}
          >
            {formatTime(currentTime)}
          </span>
        </div>

        {/* ── 音量条 ── */}
        <div className="flex items-center gap-1.5">
          <VolumeIcon
            className="w-3 h-3 shrink-0"
            style={{ color: hasCover ? 'rgba(255,255,255,0.4)' : 'rgba(90,64,48,0.35)' }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="音量"
            className="w-[100px] h-1 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${hasCover ? '#6AADF0' : '#4A8FD4'} ${volume * 100}%, ${hasCover ? 'rgba(255,255,255,0.15)' : 'rgba(180,160,120,0.25)'} ${volume * 100}%)`,
              outline: 'none',
              accentColor: '#4A8FD4',
            }}
          />
        </div>
      </div>

      {/* ── 控制按钮 ── */}
      <div className="flex items-center gap-1 shrink-0 relative z-[1]">
        <button
          type="button" aria-label="循环模式" onClick={toggleRepeat}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${repeatColors[repeatMode]}`}
          style={{ background: repeatMode !== 'off' ? 'rgba(74,143,212,0.15)' : 'transparent' }}
        >
          <Repeat className="w-3.5 h-3.5" />
          {repeatMode === 'one' && <span className="absolute text-[6px] font-bold text-blue-400 -top-0.5">1</span>}
        </button>

        <button
          type="button" aria-label="上一首" onClick={handlePrev}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${hasCover ? 'text-white/35 hover:text-white/70 hover:bg-white/8' : 'text-[#5a4030]/40 hover:text-[#5a4030]/70 hover:bg-[#5a4030]/8'}`}
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <motion.button
          type="button" aria-label={isPlaying ? '暂停' : '播放'} onClick={togglePlay}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #4A8FD4 0%, #3570B0 100%)',
            boxShadow: '0 2px 8px rgba(74,143,212,0.45), 0 0 16px rgba(74,143,212,0.2)',
          }}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
          ) : (
            <Play className="w-3.5 h-3.5 text-white ml-0.5" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
          )}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '2px solid rgba(74,143,212,0.4)' }}
              animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.button>

        <button
          type="button" aria-label="下一首" onClick={handleNext}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${hasCover ? 'text-white/35 hover:text-white/70 hover:bg-white/8' : 'text-[#5a4030]/40 hover:text-[#5a4030]/70 hover:bg-[#5a4030]/8'}`}
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          type="button" aria-label="列表"
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${hasCover ? 'text-white/35 hover:text-white/70 hover:bg-white/8' : 'text-[#5a4030]/40 hover:text-[#5a4030]/70 hover:bg-[#5a4030]/8'}`}
        >
          <ListMusic className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
