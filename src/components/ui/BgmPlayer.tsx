import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeftRight, Shuffle, SkipBack, Pause, Play, SkipForward, ListMusic, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { BgmPlaylistPopover } from './BgmPlaylistPopover';
import { loadBgmPlaylist, flattenTracks, type BgmTrack, type BgmScanResult } from '@/lib/bgm-loader';

// ── 唱片纹理圆环尺寸（适配 52px 唱片）──
const GROOVE_RINGS = [23, 26, 29, 32, 35, 38, 41, 44, 47];

// ── 黑金主题色 ──
const GOLD = {
  primary: '#C9A84C',
  light: '#D4B85A',
  dark: '#A0802E',
  text: '#E8D59A',
  muted: 'rgba(232,213,154,0.45)',
  glow: 'rgba(201,168,76,0.35)',
  bg: 'rgba(201,168,76,0.10)',
};

/** 随机选曲（排除当前索引） */
function getRandomIndex(length: number, exclude: number): number {
  if (length <= 1) return 0;
  let idx: number;
  do { idx = Math.floor(Math.random() * length); } while (idx === exclude);
  return idx;
}

export function BgmPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [, setCoverLoaded] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [bgmResult, setBgmResult] = useState<BgmScanResult>({ categories: [], tracksByCategory: {} });
  const [playlist, setPlaylist] = useState<BgmTrack[]>([]);
  // ── 10 秒倒计时（null = 非倒计时中）──
  const [countdown, setCountdown] = useState<number | null>(null);
  // ── 上一首历史栈（随机模式专用）──
  const [prevHistory, setPrevHistory] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const listBtnRef = useRef<HTMLDivElement>(null);

  // ── Refs：保持回调/值最新，避免闭包过期 ──
  const handleNextRef = useRef<() => void>(() => {});
  const isPlayingRef = useRef(isPlaying);
  const shuffleRef = useRef(shuffleMode);
  const countdownRef = useRef(countdown);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forcePlayRef = useRef(false);
  isPlayingRef.current = isPlaying;
  shuffleRef.current = shuffleMode;
  countdownRef.current = countdown;

  // ── 清除倒计时 ──
  const clearCountdown = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
  }, []);

  // ── 启动时加载 BGM 清单 ──
  useEffect(() => {
    loadBgmPlaylist().then((result) => {
      setBgmResult(result);
      const flat = flattenTracks(result);
      setPlaylist(flat);
    });
  }, []);

  // ── 倒计时 Effect ──
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0 && timerRef.current === null) {
        // 倒计时归零 → 执行重播
        setCountdown(null);
        const audio = audioRef.current;
        if (!audio) return;
        if (shuffleRef.current && playlist.length > 1) {
          // 随机模式：切到随机曲目并播放
          forcePlayRef.current = true;
          const nextIdx = getRandomIndex(playlist.length, currentIndex);
          setCurrentIndex(nextIdx);
        } else {
          // 顺序模式：重播当前曲目
          audio.currentTime = 0;
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
      return;
    }
    // 启动定时器
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return 0; // 触发归零
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentTrack: BgmTrack | undefined = playlist[currentIndex];
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
      setIsPlaying(false);
      // 清除旧定时器，启动 10 秒倒计时
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(10);
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

  // ── 切换音轨时加载新音频（包括首次加载）──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    // 避免同一音轨重复加载
    if (audio.src && audio.src.endsWith(currentTrack.audioUrl.replace(/^\//, ''))) return;
    const shouldAutoPlay = !audio.paused || isPlayingRef.current || forcePlayRef.current;
    forcePlayRef.current = false;
    audio.src = currentTrack.audioUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (shouldAutoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentTrack?.audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 音量变更 ──
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // ── 关闭播放列表（稳定引用）──
  const handleClosePlaylist = useCallback(() => setShowPlaylist(false), []);

  // ── 播放/暂停 ──
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    // 取消倒计时（如有）
    clearCountdown();
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack, clearCountdown]);

  // ── 上一首 ──
  const handlePrev = useCallback(() => {
    clearCountdown();
    if (playlist.length <= 1) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
      return;
    }
    // 随机模式下优先从历史栈弹出
    const targetIdx = prevHistory.length > 0
      ? prevHistory[prevHistory.length - 1]
      : (currentIndex === 0 ? playlist.length - 1 : currentIndex - 1);
    if (prevHistory.length > 0) {
      setPrevHistory((h) => h.slice(0, -1));
    }
    forcePlayRef.current = true;
    setIsPlaying(true);
    setCurrentIndex(targetIdx);
  }, [playlist.length, currentIndex, prevHistory, clearCountdown]);

  const handleNext = useCallback(() => {
    clearCountdown();
    if (playlist.length <= 1) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
      return;
    }
    // 随机模式下记录当前索引到历史栈
    if (shuffleMode) {
      setPrevHistory((h) => {
        const next = [...h, currentIndex];
        return next.length > 50 ? next.slice(-50) : next;
      });
    }
    const nextIdx = shuffleMode
      ? getRandomIndex(playlist.length, currentIndex)
      : (currentIndex === playlist.length - 1 ? 0 : currentIndex + 1);
    forcePlayRef.current = true;
    setIsPlaying(true);
    setCurrentIndex(nextIdx);
  }, [playlist.length, currentIndex, shuffleMode, clearCountdown]);
  handleNextRef.current = handleNext;

  // ── 随机模式开关 ──
  const toggleShuffle = useCallback(() => {
    setShuffleMode((v) => !v);
    setPrevHistory([]); // 切换时清空历史
  }, []);

  // ── 选歌回调 ──
  const handleSelectTrack = useCallback((track: BgmTrack) => {
    clearCountdown();
    const idx = playlist.findIndex((t) => t.audioUrl === track.audioUrl);
    if (idx >= 0) {
      setPrevHistory([]);
      setCurrentIndex(idx);
    }
  }, [playlist, clearCountdown]);

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

  // 共用斜边百分比
  const slantPct = '8%';

  return (
    <div
      ref={playerRef}
      id="topbar-bgm-player"
      className="h-16 flex items-center gap-3 pl-8 pr-4 relative"
      style={{
        // 毛玻璃黑底
        background: 'rgba(18,15,10,0.72)',
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)`,
        filter: 'drop-shadow(-2px 0 8px rgba(0,0,0,0.15))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)',
      }}
    >
      {/* ── 封面毛玻璃背景 ── */}
      {hasCover && (
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)` }}>
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="absolute w-full h-full object-cover"
            style={{
              filter: 'blur(20px) brightness(0.35) saturate(1.4)',
              transform: 'scale(1.2)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,12,8,0.45)' }}
          />
        </div>
      )}

      {/* ── 顶部金线微光 ── */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.25) 20%, rgba(201,168,76,0.45) 50%, rgba(201,168,76,0.25) 80%, transparent 100%)',
          clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)`,
        }}
      />

      {/* 斜边金色渐变高光 */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: '80px',
          background: 'linear-gradient(90deg, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0.06) 35%, rgba(201,168,76,0.02) 65%, transparent 100%)',
          left: '0px',
        }}
      />

      {/* 背景暖金光晕 */}
      <div
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none opacity-12"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
        }}
      />

      {/* ── 唱片区域 52×52 ── */}
      <div className="relative w-[52px] h-[52px] shrink-0">
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(25,20,12,0.7) 0%, rgba(15,12,8,0.85) 60%, rgba(18,14,10,0.8) 100%)',
            boxShadow: '0 3px 14px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.08), inset 0 0 0 1px rgba(255,255,255,0.03)',
          }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={isPlaying ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
        >
          {/* 唱片纹理 —— 同心圆轨道（金色微光） */}
          {GROOVE_RINGS.map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                border: `0.5px solid rgba(201,168,76,${i % 3 === 0 ? 0.09 : 0.04})`,
                opacity: i % 3 === 0 ? 0.7 : 0.3,
              }}
            />
          ))}

          {/* 封面 / 占位 */}
          <div
            className="absolute rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: '33px',
              height: '33px',
              border: `1.5px solid rgba(201,168,76,0.14)`,
              background: hasCover ? '#1a1a1a' : 'radial-gradient(circle at 50% 50%, #2a2418 0%, #1a1610 100%)',
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
              <span className="text-[8px] text-[#C9A84C]/30 tracking-wider font-number">LP</span>
            )}
          </div>

          {/* 中心金标 */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: '12px',
              height: '12px',
              background: `linear-gradient(135deg, ${GOLD.primary} 0%, ${GOLD.dark} 100%)`,
              boxShadow: `0 0 5px ${GOLD.glow}`,
            }}
          >
            <div className="rounded-full" style={{ width: '3.5px', height: '3.5px', background: '#12100c' }} />
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
              background: GOLD.primary,
              top: '3px', left: '2.5px',
              boxShadow: `0 0 2px ${GOLD.glow}`,
            }}
          />
        </div>
      </div>

      {/* ── 歌曲信息 + 进度条 / 倒计时 + 音量 ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-[2px] relative z-[1]">
        {/* 歌名 */}
        <motion.span
          className="block text-[12px] font-bold truncate leading-tight"
          style={{ color: GOLD.text }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          《{currentTrack?.title ?? '未播放歌曲'}》
        </motion.span>

        {/* 倒计时 / 波形进度条 */}
        {countdown !== null && countdown > 0 ? (
          <div className="flex items-center gap-1.5 h-2.5">
            <span
              className="text-[9px] font-number"
              style={{ color: GOLD.muted }}
            >
              {countdown} 秒后
              <span style={{ color: GOLD.light }}> {shuffleMode ? '随机' : '重'}播</span>
            </span>
          </div>
        ) : (
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
                        ? `linear-gradient(180deg, ${GOLD.light} 0%, ${GOLD.dark} 100%)`
                        : 'rgba(255,255,255,0.06)',
                      boxShadow: isPlayed ? `0 0 4px ${GOLD.glow}` : 'none',
                    }}
                  />
                );
              })}
            </div>
            <span
              className="text-[8px] font-number shrink-0"
              style={{ color: GOLD.muted }}
            >
              {formatTime(currentTime)}
            </span>
          </div>
        )}

        {/* ── 音量条 ── */}
        <div className="flex items-center gap-1.5">
          <VolumeIcon
            className="w-3 h-3 shrink-0"
            style={{ color: GOLD.muted }}
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
              background: `linear-gradient(90deg, ${GOLD.primary} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
              outline: 'none',
              accentColor: GOLD.primary,
            }}
          />
        </div>
      </div>

      {/* ── 控制按钮 ── */}
      <div className="flex items-center gap-1 shrink-0 relative z-[1]">
        {/* 随机播放按钮 */}
        <button
          type="button" aria-label="随机播放" onClick={toggleShuffle}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            color: shuffleMode ? GOLD.light : 'rgba(255,255,255,0.3)',
            background: shuffleMode ? GOLD.bg : 'transparent',
          }}
        >
          {shuffleMode ? (
            <Shuffle className="w-3.5 h-3.5" />
          ) : (
            <ArrowLeftRight className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button" aria-label="上一首" onClick={handlePrev}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-white/30 hover:text-white/60 hover:bg-white/6"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <motion.button
          type="button" aria-label={isPlaying ? '暂停' : '播放'} onClick={togglePlay}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${GOLD.primary} 0%, ${GOLD.dark} 100%)`,
            boxShadow: `0 2px 10px ${GOLD.glow}, 0 0 20px rgba(201,168,76,0.18)`,
          }}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-[#12100c]" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }} />
          ) : (
            <Play className="w-3.5 h-3.5 text-[#12100c] ml-0.5" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }} />
          )}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: `2px solid ${GOLD.glow}` }}
              animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.button>

        <button
          type="button" aria-label="下一首" onClick={handleNext}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-white/30 hover:text-white/60 hover:bg-white/6"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* ── 列表按钮 ── */}
        <div className="relative" ref={listBtnRef}>
          <button
            type="button"
            aria-label="播放列表"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
            onClick={() => setShowPlaylist((v) => !v)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              color: showPlaylist ? GOLD.light : 'rgba(255,255,255,0.35)',
              background: showPlaylist ? GOLD.bg : 'transparent',
            }}
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>

          {/* 弹窗 */}
          {showPlaylist && (
            <BgmPlaylistPopover
              result={bgmResult}
              currentAudioUrl={currentTrack?.audioUrl ?? null}
              onSelect={handleSelectTrack}
              onClose={handleClosePlaylist}
              anchorEl={listBtnRef.current}
            />
          )}
        </div>
      </div>
    </div>
  );
}
