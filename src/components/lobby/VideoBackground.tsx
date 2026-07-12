import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

// 动态扫描 public/videos 下所有 .mp4 文件，新增/删除即生效
const videoGlob = import.meta.glob('/public/videos/shipinbeijing*/*.mp4', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

// 提取 URL 并按文件夹分类
function buildVideoList(): string[] {
  return Object.values(videoGlob).map(url => {
    // Vite 返回的 URL 格式：/videos/shipinbeijing60/xxx.mp4
    return url;
  });
}

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switching = useRef(false); // 防止重复切换

  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [opacity, setOpacity] = useState(1);

  const videosRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const mutedRef = useRef(true);
  const volRef = useRef(0.5);

  useEffect(() => { videosRef.current = videos; }, [videos]);
  useEffect(() => { idxRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { volRef.current = volume; }, [volume]);

  // 判断当前视频是否为 120s 定时模式
  const isTimerVideo = (url: string) => url.includes('shipinbeijing60');

  // ---- 初始化：动态加载扫描到的全部视频 ----
  useEffect(() => {
    const urls = buildVideoList();
    console.log(`📂 动态扫描到 ${urls.length} 个视频:`, urls.map(u => u.split('/').pop()));
    setVideos(urls);
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

  // ---- 定时模式：120 秒强切（仅 shipinbeijing60 视频，播放中才计时） ----
  useEffect(() => {
    const url = videos[currentIndex];
    if (!url || !isTimerVideo(url) || !isPlaying) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      switchVideo((currentIndex + 1) % videos.length);
    }, 120_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, videos, switchVideo, isPlaying]);

  // ---- 播完处理 ----
  const handleEnded = useCallback(() => {
    const url = videosRef.current[idxRef.current];
    if (isTimerVideo(url)) {
      // shipinbeijing60：不足 120 秒播完 → 循环重复
      videoRef.current?.play();
    } else {
      // shipinbeijing00：播完即切下一个
      const next = (idxRef.current + 1) % videosRef.current.length;
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

  const fileName = decodeURIComponent(videos[currentIndex]?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '');

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
      <div style={{ position:'fixed',inset:0,zIndex:1,
        background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)',
        pointerEvents:'none' }} />
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
  background:'rgba(0,0,0,0.35)',backdropFilter:'blur(16px)',
  WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.2)',
};
const ctrlTitle: React.CSSProperties = { color:'rgba(255,255,255,0.9)',fontSize:'0.8rem',margin:0 };
const ctrlRow: React.CSSProperties = { display:'flex',alignItems:'center',gap:6 };
const btn: React.CSSProperties = {
  padding:6,border:'1px solid rgba(255,255,255,0.2)',
  background:'rgba(255,255,255,0.1)',color:'white',borderRadius:6,
  cursor:'pointer',display:'flex',alignItems:'center',
};
