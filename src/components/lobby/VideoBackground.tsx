import { useState, useRef, useEffect, useCallback } from 'react';
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

type PlayMode = 'timer' | 'natural';

export function VideoBackground() {
  const [mode, setMode] = useState<PlayMode>('timer');
  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [muteAuto, setMuteAuto] = useState(false);
  const [started, setStarted] = useState(false);
  const userWantsSound = useRef(false); // 用户是否主动要求有声

  // 双 video 元素用于交叉渐变
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');
  const [fading, setFading] = useState(false);
  const skipReload = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadedRef = useRef<Set<number>>(new Set());
  const videosRef = useRef<string[]>([]);
  const volumeRef = useRef(0.5);
  useEffect(() => { videosRef.current = videos; }, [videos]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // 获取当前和备用的 video ref
  const getCurrentVideo = () => activeVideo === 'A' ? videoARef.current : videoBRef.current;
  const getNextVideo = () => activeVideo === 'A' ? videoBRef.current : videoARef.current;

  // 初始化
  useEffect(() => {
    (async () => {
      const folder = Math.random() < 0.5 ? 'videos/shipinbeijing60' : 'videos/shipinbeijing00';
      setMode(folder.includes('60') ? 'timer' : 'natural');
      const urls = await detectVideos(folder);
      setVideos(urls);
    })();
  }, []);

  // 光球点击后：启动 + 解除静音（用户手势允许有声播放）
  useEffect(() => {
    const handler = () => {
      const v = getCurrentVideo();
      const urls = videosRef.current;
      if (v && urls.length > 0) {
        v.src = urls[0]; // 从第一个视频开始
        v.load();
        userWantsSound.current = true;
        v.muted = false;
        setIsMuted(false);
        setMuteAuto(false);
        v.volume = volumeRef.current;
        v.play().catch(() => {});
      }
      setStarted(true);
    };
    window.addEventListener('orb-clicked', handler);
    return () => window.removeEventListener('orb-clicked', handler);
  }, []);

  // 预加载下一个视频
  const preloadNext = useCallback((nextIdx: number) => {
    if (preloadedRef.current.has(nextIdx) || nextIdx >= videos.length) return;
    const nextVid = getNextVideo();
    if (nextVid && videos[nextIdx]) {
      nextVid.src = videos[nextIdx];
      nextVid.load();
      preloadedRef.current.add(nextIdx);
    }
  }, [videos]);

  // 加载当前视频到活跃元素
  useEffect(() => {
    if (skipReload.current) { skipReload.current = false; return; }
    const currVid = getCurrentVideo();
    if (!currVid || videos.length === 0 || !started) return;
    currVid.src = videos[currentIndex];
    currVid.volume = isMuted ? 0 : volume;
    currVid.muted = isMuted;
    currVid.style.opacity = '1';
    if (isPlaying) currVid.play().catch(() => {
      if (!userWantsSound.current) { currVid.muted = true; setIsMuted(true); setMuteAuto(true); currVid.play(); }
      else { currVid.play().catch(() => {}); }
    });
    // 预加载下一个
    preloadNext((currentIndex + 1) % videos.length);
    preloadedRef.current.add(currentIndex);
  }, [currentIndex, videos, started]);

  // 交叉渐变切换视频
  const crossfadeTo = useCallback((nextIdx: number) => {
    if (fading || videos.length === 0) return;
    setFading(true);

    const currVid = getCurrentVideo();
    const nextVid = getNextVideo();
    if (!currVid || !nextVid) { setFading(false); return; }

    // 备用的已经预加载好了
    nextVid.src = videos[nextIdx];
    nextVid.volume = 0;
    nextVid.muted = isMuted;
    nextVid.style.opacity = '0';
    nextVid.style.transition = 'opacity 1.5s ease-in-out';
    nextVid.currentTime = 0;
    nextVid.play().catch(() => {});

    // 音频渐变
    const audioFadeSteps = 30;
    const audioFadeMs = 50;
    let step = 0;
    const origVol = isMuted ? 0 : volume;
    const fadeAudio = setInterval(() => {
      step++;
      const ratio = step / audioFadeSteps;
      if (currVid) currVid.volume = origVol * (1 - ratio);
      if (nextVid) nextVid.volume = origVol * ratio;
      if (step >= audioFadeSteps) clearInterval(fadeAudio);
    }, audioFadeMs);

    // 视频渐变
    currVid.style.transition = 'opacity 1.5s ease-in-out';
    currVid.style.opacity = '0';
    nextVid.style.opacity = '1';

    setTimeout(() => {
      currVid.pause();
      currVid.style.transition = 'none';
      nextVid.style.transition = 'none';
      skipReload.current = true; // 跳过 useEffect 重载
      setActiveVideo(activeVideo === 'A' ? 'B' : 'A');
      setCurrentIndex(nextIdx);
      setFading(false);
      clearInterval(fadeAudio);
      preloadNext((nextIdx + 1) % videos.length);
    }, 1600);
  }, [fading, videos, activeVideo, isMuted, volume, preloadNext]);

  // 定时模式：120 秒交叉渐变
  useEffect(() => {
    if (mode !== 'timer' || videos.length === 0 || !started) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      crossfadeTo((currentIndex + 1) % videos.length);
    }, 120_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, mode, videos.length, started, crossfadeTo]);

  // 自然模式：播完渐变到下一个
  const handleEnded = useCallback(() => {
    if (mode === 'timer') {
      getCurrentVideo()?.play(); // 循环当前
    } else {
      crossfadeTo((currentIndex + 1) % videos.length);
    }
  }, [mode, videos.length, crossfadeTo, currentIndex]);

  // 控件
  const togglePlay = () => {
    const v = getCurrentVideo();
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
  };
  const prevVideo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    crossfadeTo(currentIndex === 0 ? videos.length - 1 : currentIndex - 1);
  };
  const nextVideo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    crossfadeTo((currentIndex + 1) % videos.length);
  };
  const toggleMute = () => {
    const v = getCurrentVideo();
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(!isMuted);
    setMuteAuto(false);
    if (!v.muted) userWantsSound.current = true;
  };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = getCurrentVideo();
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(false);
    setMuteAuto(false);
    userWantsSound.current = true;
    if (v) { v.volume = val; v.muted = false; }
  };

  const currentFileName = videos[currentIndex]?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  if (videos.length === 0) {
    return <div style={{ position:'fixed',inset:0,zIndex:0,background:'#000' }} />;
  }

  const ctrlBar: React.CSSProperties = {
    position: 'fixed', top: 20, right: 20, zIndex: 9999,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.15)',
  };
  const btn: React.CSSProperties = {
    padding: 6, border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 6,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
  };

  return (
    <>
      {/* 视频 A */}
      <video ref={videoARef} autoPlay playsInline
        onEnded={handleEnded}
        onError={() => crossfadeTo((currentIndex + 1) % videos.length)}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none', opacity: activeVideo === 'A' ? 1 : 0,
        }}
      />
      {/* 视频 B */}
      <video ref={videoBRef} playsInline
        onEnded={handleEnded}
        onError={() => crossfadeTo((currentIndex + 1) % videos.length)}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none', opacity: activeVideo === 'B' ? 1 : 0,
        }}
      />

      {/* 遮罩 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />

      {/* 播放器控件 */}
      <div style={ctrlBar}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', margin: 0 }}>《{currentFileName}》</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={prevVideo} style={btn} title="上一曲"><SkipBack size={16} /></button>
          <button onClick={togglePlay} style={btn} title={isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextVideo} style={btn} title="下一曲"><SkipForward size={16} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={toggleMute} style={{
            ...btn,
            animation: muteAuto ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
            borderColor: muteAuto ? 'rgba(251,146,60,0.6)' : btn.borderColor,
          }} title={isMuted ? (muteAuto ? '浏览器限制了声音，点击开启' : '取消静音') : '静音'}>
            {isMuted ? <VolumeX size={14} color={muteAuto ? '#fb923c' : 'white'} /> : <Volume2 size={14} />}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
            onChange={handleVolume} style={{ width: 60, accentColor: 'white' }} />
        </div>
      </div>
    </>
  );
}
