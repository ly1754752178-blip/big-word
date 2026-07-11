import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const ALL_VIDEOS = [
  'videos/shipinbeijing60/孤独摇滚1.mp4',
  'videos/shipinbeijing60/孤独摇滚2.mp4',
  'videos/shipinbeijing00/孤独摇滚3.mp4',
];

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switching = useRef(false); // 防止重复切换

  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'timer' | 'natural'>('timer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [opacity, setOpacity] = useState(1); // 渐出渐入

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

  // ---- 初始化 ----
  useEffect(() => {
    const isTimer = Math.random() < 0.5;
    setMode(isTimer ? 'timer' : 'natural');
    setVideos(ALL_VIDEOS.map(p => `/${p}`));
    console.log(`🎲 模式: ${isTimer ? '120s定时' : '播完切换'}`);
  }, []);

  // ---- 切换视频：渐出 → 换源 → 渐入 ----
  const switchVideo = useCallback((nextIdx: number) => {
    const v = videoRef.current;
    if (!v || switching.current) return;
    switching.current = true;

    // 渐出
    setOpacity(0);
    setTimeout(() => {
      if (!v) { switching.current = false; return; }
      // 换源
      v.src = videosRef.current[nextIdx];
      v.muted = mutedRef.current;
      v.volume = mutedRef.current ? 0 : volRef.current;
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
      setCurrentIndex(nextIdx);
      setIsPlaying(true);
      // 渐入
      setTimeout(() => {
        setOpacity(1);
        switching.current = false;
      }, 200);
    }, 800); // 渐出持续 800ms
  }, []);

  // 初始加载
  useEffect(() => {
    const v = videoRef.current;
    if (!v || videos.length === 0 || switching.current) return;
    v.src = videos[currentIndex];
    v.muted = true;
    v.volume = 0;
    v.play().catch(() => {});
    setIsPlaying(true);
  }, [videos]);

  // currentIndex 变化时切换（由定时器或手动操作触发）
  useEffect(() => {
    const v = videoRef.current;
    if (!v || videos.length === 0 || switching.current) return;
    // 有 src 且不是初始加载 → 正常切换
    if (v.src) {
      v.src = videos[currentIndex];
      v.muted = mutedRef.current;
      v.volume = mutedRef.current ? 0 : volRef.current;
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // ---- 定时模式 120 秒（渐出渐入） ----
  useEffect(() => {
    if (mode !== 'timer' || videos.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      switchVideo((currentIndex + 1) % videos.length);
    }, 120_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [mode, currentIndex, videos.length, switchVideo]);

  // ---- 自然模式：播完渐出渐入切下一个 ----
  const handleEnded = useCallback(() => {
    console.log('🏁 视频播完, mode:', modeRef.current);
    if (modeRef.current === 'timer') {
      videoRef.current?.play(); // 循环当前
    } else {
      const next = (idxRef.current + 1) % videosRef.current.length;
      console.log('→ 切换到:', next);
      switchVideo(next);
    }
  }, [switchVideo]);

  // ---- 光球点击：解除静音 ----
  const unmuteRef = useRef(() => {
    const v = videoRef.current;
    if (v) { v.muted = false; v.volume = volRef.current; setIsMuted(false); }
  });
  unmuteRef.current = () => {
    const v = videoRef.current;
    if (v) { v.muted = false; v.volume = volRef.current; setIsMuted(false); }
  };
  useEffect(() => {
    const handler = () => unmuteRef.current();
    window.addEventListener('orb-clicked', handler);
    return () => window.removeEventListener('orb-clicked', handler);
  }, []);

  // ---- 控件 ----
  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
  };
  const prevVideo = () => { if (timerRef.current) clearTimeout(timerRef.current); switchVideo(currentIndex === 0 ? videos.length - 1 : currentIndex - 1); };
  const nextVideo = () => { if (timerRef.current) clearTimeout(timerRef.current); switchVideo((currentIndex + 1) % videos.length); };
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setIsMuted(!isMuted);
  };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = Number(e.target.value);
    setVolume(val); setIsMuted(false);
    v.volume = val; v.muted = false;
  };

  const fileName = videos[currentIndex]?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  return (
    <>
      <video
        ref={videoRef}
        playsInline preload="auto"
        onEnded={handleEnded}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none',
          background: '#0a0a0a',
          opacity, transition: 'opacity 0.8s ease-in-out',
        }}
      />
      <div style={{ position:'fixed',inset:0,zIndex:1,background:'rgba(0,0,0,0.4)',pointerEvents:'none' }} />
      <div style={ctrlBar}>
        <p style={ctrlTitle}>《{fileName}》</p>
        <div style={ctrlRow}>
          <button onClick={prevVideo} style={btn} title="上一曲"><SkipBack size={16} /></button>
          <button onClick={togglePlay} style={btn} title={isPlaying?'暂停':'播放'}>
            {isPlaying?<Pause size={16}/>:<Play size={16}/>}
          </button>
          <button onClick={nextVideo} style={btn} title="下一曲"><SkipForward size={16} /></button>
        </div>
        <div style={ctrlRow}>
          <button onClick={toggleMute} style={btn} title={isMuted?'取消静音':'静音'}>
            {isMuted?<VolumeX size={14}/>:<Volume2 size={14}/>}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted?0:volume}
            onChange={handleVolume} style={{width:60,accentColor:'white'}}/>
        </div>
      </div>
    </>
  );
}

const ctrlBar: React.CSSProperties = {
  position:'fixed',top:20,right:20,zIndex:9999,
  display:'flex',flexDirection:'column',alignItems:'center',gap:8,
  padding:'12px 16px',borderRadius:12,
  background:'rgba(255,255,255,0.08)',backdropFilter:'blur(16px)',
  WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.15)',
};
const ctrlTitle: React.CSSProperties = { color:'rgba(255,255,255,0.9)',fontSize:'0.8rem',margin:0 };
const ctrlRow: React.CSSProperties = { display:'flex',alignItems:'center',gap:6 };
const btn: React.CSSProperties = {
  padding:6,border:'1px solid rgba(255,255,255,0.2)',
  background:'rgba(255,255,255,0.1)',color:'white',borderRadius:6,
  cursor:'pointer',display:'flex',alignItems:'center',
};
