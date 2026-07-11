import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX,
} from 'lucide-react';

function getVideoUrls(folder: string): string[] {
  const knownVideos = ['孤独摇滚1.mp4', '孤独摇滚2.mp4', '孤独摇滚3.mp4'];
  return knownVideos.map((name) => `/${folder}/${name}`);
}

type PlayMode = 'timer' | 'natural';

export function VideoBackground() {
  const [mode, setMode] = useState<PlayMode>('timer');
  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const folder = Math.random() < 0.5
      ? 'videos/shipinbeijing60'
      : 'videos/shipinbeijing00';
    const selectedMode: PlayMode = folder.includes('60') ? 'timer' : 'natural';
    setMode(selectedMode);
    setVideos(getVideoUrls(folder));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0) return;
    video.src = videos[currentIndex];
    if (isPlaying) video.play().catch(() => {});
  }, [currentIndex, videos, isPlaying]);

  useEffect(() => {
    if (mode !== 'timer' || videos.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % videos.length);
    }, 60_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, mode, videos.length]);

  const handleEnded = useCallback(() => {
    if (mode === 'timer') {
      videoRef.current?.play();
    } else {
      setCurrentIndex((i) => (i + 1) % videos.length);
    }
  }, [mode, videos.length]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const prevVideo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex((i) => (i === 0 ? videos.length - 1 : i - 1));
  };

  const nextVideo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex((i) => (i + 1) % videos.length);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    setIsMuted(false);
  };

  const currentFileName = videos[currentIndex]
    ?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  if (videos.length === 0) return null;

  // --- 内联样式，强制可见 ---
  const ctrlBar: React.CSSProperties = {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.15)',
  };

  const btn: React.CSSProperties = {
    padding: 6,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  return (
    <>
      {/* 视频背景 */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        onEnded={handleEnded}
        playsInline
        loop={mode === 'timer'}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* 半透明遮罩 */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        background: 'rgba(0,0,0,0.4)',
        pointerEvents: 'none',
      }} />

      {/* 播放器控件 — 强制内联 */}
      <div style={ctrlBar}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', margin: 0 }}>
          《{currentFileName}》
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={prevVideo} style={btn} title="上一曲">
            <SkipBack size={16} />
          </button>
          <button onClick={togglePlay} style={btn} title={isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextVideo} style={btn} title="下一曲">
            <SkipForward size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={toggleMute} style={btn} title={isMuted ? '取消静音' : '静音'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            style={{ width: 60, accentColor: 'white' }}
          />
        </div>
      </div>
    </>
  );
}
