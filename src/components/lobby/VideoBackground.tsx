import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

async function detectVideos(folder: string): Promise<string[]> {
  const candidates = ['孤独摇滚1.mp4', '孤独摇滚2.mp4', '孤独摇滚3.mp4'];
  const results: string[] = [];
  for (const name of candidates) {
    try {
      const res = await fetch(`/${folder}/${name}`, { method: 'HEAD' });
      if (res.ok) results.push(`/${folder}/${name}`);
    } catch { /* skip */ }
  }
  return results;
}

export function VideoBackground() {
  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [muteAuto, setMuteAuto] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'timer' | 'natural'>('timer');
  const [volume, setVolumeState] = useState(0.5);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userWantsSound = useRef(false);

  // 初始化
  useEffect(() => {
    (async () => {
      const folder = Math.random() < 0.5 ? 'videos/shipinbeijing60' : 'videos/shipinbeijing00';
      setMode(folder.includes('60') ? 'timer' : 'natural');
      const urls = await detectVideos(folder);
      setVideos(urls);
    })();
  }, []);

  // 光球点击 → 加载并播放
  useEffect(() => {
    const handler = () => {
      userWantsSound.current = true;
      setIsMuted(false);
      setMuteAuto(false);
      setStarted(true);
    };
    window.addEventListener('orb-clicked', handler);
    return () => window.removeEventListener('orb-clicked', handler);
  }, []);

  // 当 started 变为 true 且有视频时，加载播放
  useEffect(() => {
    const v = videoRef.current;
    if (!v || videos.length === 0 || !started) return;
    v.src = videos[currentIndex];
    v.muted = false;
    v.volume = volume;
    v.play().catch((e) => { console.warn('播放失败:', e); v.muted = true; setIsMuted(true); setMuteAuto(true); v.play(); });
    setIsPlaying(true);
  }, [started, currentIndex, videos]);

  // 定时模式：120 秒切换（渐变过渡）
  useEffect(() => {
    if (mode !== 'timer' || videos.length <= 1 || !started) return;
    timerRef.current = setTimeout(() => {
      setCurrentIndex(i => (i + 1) % videos.length);
    }, 120_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, mode, videos.length, started]);

  const handleEnded = () => {
    if (mode === 'timer') {
      videoRef.current?.play(); // 循环
    } else if (videos.length > 1) {
      setCurrentIndex(i => (i + 1) % videos.length); // 自然播完切下一个
    }
    // 自然模式单视频：不做任何事
  };

  // 控件
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
    v.muted = !v.muted; setIsMuted(!isMuted); setMuteAuto(false);
    if (!v.muted) userWantsSound.current = true;
  };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = Number(e.target.value);
    setVolumeState(val); setIsMuted(false); setMuteAuto(false);
    v.volume = val; v.muted = false;
    userWantsSound.current = true;
  };

  const currentFileName = videos[currentIndex]?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  if (videos.length === 0) {
    return <div style={{ position:'fixed',inset:0,zIndex:0,background:'#000' }} />;
  }

  return (
    <>
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        onEnded={handleEnded}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none',
          transition: started ? 'opacity 0.5s' : 'none',
        }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />

      {/* 控件 */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <p style={{ color:'rgba(255,255,255,0.9)',fontSize:'0.8rem',margin:0 }}>《{currentFileName}》</p>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <button onClick={prevVideo} style={btn} title="上一曲"><SkipBack size={16} /></button>
          <button onClick={togglePlay} style={btn} title={isPlaying?'暂停':'播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextVideo} style={btn} title="下一曲"><SkipForward size={16} /></button>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <button onClick={toggleMute} style={{
            ...btn,
            animation: muteAuto ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
            borderColor: muteAuto ? 'rgba(251,146,60,0.6)' : btn.borderColor,
          }} title={isMuted?(muteAuto?'浏览器限制了声音，点击开启':'取消静音'):'静音'}>
            {isMuted ? <VolumeX size={14} color={muteAuto?'#fb923c':'white'} /> : <Volume2 size={14} />}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted?0:volume}
            onChange={handleVolume} style={{ width:60,accentColor:'white' }} />
        </div>
      </div>
    </>
  );
}

const btn: React.CSSProperties = {
  padding: 6, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 6,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
};
