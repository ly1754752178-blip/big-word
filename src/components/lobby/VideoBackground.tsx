import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

// ---------- 全部视频池 ----------
const ALL_VIDEOS = [
  'videos/shipinbeijing60/孤独摇滚1.mp4',
  'videos/shipinbeijing60/孤独摇滚2.mp4',
  'videos/shipinbeijing00/孤独摇滚3.mp4',
];

// ---------- 组件 ----------
export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'timer' | 'natural'>('timer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);  // 启动时静音
  const [volume, setVolume] = useState(0.5);

  // 用 ref 避免闭包过期
  const modeRef = useRef<'timer' | 'natural'>('timer');
  const videosRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const mutedRef = useRef(true);
  const volRef = useRef(0.5);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { videosRef.current = videos; }, [videos]);
  useEffect(() => { idxRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { volRef.current = volume; }, [volume]);

  // ---- 初始化：随机选切换模式，全部视频统一播放列表 ----
  useEffect(() => {
    const isTimer = Math.random() < 0.5;
    setMode(isTimer ? 'timer' : 'natural');
    const urls = ALL_VIDEOS.map(p => `/${p}`);
    console.log(`🎲 模式: ${isTimer ? '120s定时' : '播完切换'}，播放列表: ${ALL_VIDEOS.map(v => v.split('/').pop()).join(', ')}`);
    setVideos(urls);
  }, []);

  // ---- 加载并播放当前视频 ----
  const loadAndPlay = useCallback((video: HTMLVideoElement, src: string) => {
    video.src = src;
    video.muted = mutedRef.current;
    video.volume = mutedRef.current ? 0 : volRef.current;
    video.play().catch(() => {
      // 浏览器拦截非静音自动播放？静音重试
      video.muted = true;
      video.play().catch(() => {});
    });
  }, []);

  // 当 videos 或 currentIndex 变化时切换
  useEffect(() => {
    const v = videoRef.current;
    if (!v || videos.length === 0) return;
    loadAndPlay(v, videos[currentIndex]);
    setIsPlaying(true);
  }, [videos, currentIndex, loadAndPlay]);

  // ---- 定时模式 120 秒 ----
  useEffect(() => {
    if (mode !== 'timer' || videos.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex(i => (i + 1) % videos.length);
    }, 120_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [mode, currentIndex, videos.length]);

  // ---- 自然模式：播完切下一个 ----
  const handleEnded = useCallback(() => {
    if (modeRef.current === 'timer') {
      // 定时模式：视频提前播完就循环
      videoRef.current?.play();
    } else {
      // 自然模式
      const next = (idxRef.current + 1) % videosRef.current.length;
      if (next !== idxRef.current) setCurrentIndex(next);
    }
  }, []);

  // ---- 光球点击：解除静音（useRef 存回调，同步注册） ----
  const unmuteRef = useRef(() => {
    const v = videoRef.current;
    if (v) { v.muted = false; v.volume = volRef.current; setIsMuted(false); }
  });
  // 每次渲染更新 ref 确保拿到最新 videoRef + volRef
  unmuteRef.current = () => {
    const v = videoRef.current;
    if (v) { v.muted = false; v.volume = volRef.current; setIsMuted(false); }
  };
  useEffect(() => {
    const handler = () => unmuteRef.current();
    window.addEventListener('orb-clicked', handler);
    return () => window.removeEventListener('orb-clicked', handler);
  }, []);

  // ---- 播放器控件 ----
  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
  };
  const prevVideo = () => {
    if (videos.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex(i => (i === 0 ? videos.length - 1 : i - 1));
  };
  const nextVideo = () => {
    if (videos.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex(i => (i + 1) % videos.length);
  };
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted;
    setIsMuted(!isMuted);
  };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(false);
    v.volume = val;
    v.muted = false;
  };

  const fileName = videos[currentIndex]?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  // ---- 渲染 ----
  return (
    <>
      {/* 视频 */}
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        onEnded={handleEnded}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none',
          background: '#0a0a0a',
        }}
      />

      {/* 暗色遮罩 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />

      {/* 播放器控件 */}
      <div style={ctrlBar}>
        <p style={ctrlTitle}>《{fileName}》</p>
        <div style={ctrlRow}>
          <button onClick={prevVideo} style={{...btn, opacity: videos.length <= 1 ? 0.3 : 1, cursor: videos.length <= 1 ? 'default' : 'pointer'}} title="上一曲" disabled={videos.length <= 1}><SkipBack size={16} /></button>
          <button onClick={togglePlay} style={btn} title={isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextVideo} style={{...btn, opacity: videos.length <= 1 ? 0.3 : 1, cursor: videos.length <= 1 ? 'default' : 'pointer'}} title="下一曲" disabled={videos.length <= 1}><SkipForward size={16} /></button>
        </div>
        <div style={ctrlRow}>
          <button onClick={toggleMute} style={btn} title={isMuted ? '取消静音' : '静音'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input type="range" min="0" max="1" step="0.05"
            value={isMuted ? 0 : volume} onChange={handleVolume}
            style={{ width: 60, accentColor: 'white' }} />
        </div>
      </div>
    </>
  );
}

// ---------- 内联样式 ----------
const ctrlBar: React.CSSProperties = {
  position: 'fixed', top: 20, right: 20, zIndex: 9999,
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  padding: '12px 16px', borderRadius: 12,
  background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)',
};
const ctrlTitle: React.CSSProperties = { color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', margin: 0 };
const ctrlRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6 };
const btn: React.CSSProperties = {
  padding: 6, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 6,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
};
