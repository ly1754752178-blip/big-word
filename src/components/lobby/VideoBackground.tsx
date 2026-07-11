import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX,
} from 'lucide-react';

/** 获取文件夹内所有视频文件 URL */
function getVideoUrls(folder: string): string[] {
  // 由于 Vite 不支持动态 glob 导入任意 public 文件，
  // 使用固定文件名列表方式。实际播放时通过 fetch 探测文件是否存在。
  // 策略：预先维护一个已知视频文件名列表
  const knownVideos = [
    '孤独摇滚1.mp4',
    '孤独摇滚2.mp4',
    '孤独摇滚3.mp4',
  ];
  return knownVideos.map((name) => `/${folder}/${name}`);
}

type PlayMode = 'timer' | 'natural';

export function VideoBackground() {
  const [mode, setMode] = useState<PlayMode>('timer');
  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true); // 默认静音以允许自动播放
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 启动时随机选择文件夹和模式
  useEffect(() => {
    const folder = Math.random() < 0.5
      ? 'videos/shipinbeijing60'
      : 'videos/shipinbeijing00';
    const selectedMode: PlayMode = folder.includes('60') ? 'timer' : 'natural';
    setMode(selectedMode);
    const urls = getVideoUrls(folder);
    setVideos(urls);
  }, []);

  // 播放当前视频
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0) return;
    video.src = videos[currentIndex];
    if (isPlaying) video.play().catch(() => {});
  }, [currentIndex, videos, isPlaying]);

  // 定时模式：60 秒强切
  useEffect(() => {
    if (mode !== 'timer' || videos.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % videos.length);
    }, 60_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, mode, videos.length]);

  // 自然模式：视频播完触发下一首
  const handleEnded = useCallback(() => {
    if (mode === 'timer') {
      videoRef.current?.play();
    } else {
      setCurrentIndex((i) => (i + 1) % videos.length);
    }
  }, [mode, videos.length]);

  // 控件操作
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

  // 提取文件名（不含扩展名）
  const currentFileName = videos[currentIndex]
    ?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  if (videos.length === 0) return null;

  return (
    <div className="video-bg">
      <video
        ref={videoRef}
        className="video-bg__video"
        autoPlay
        muted={isMuted}
        onEnded={handleEnded}
        playsInline
        loop={mode === 'timer'}
      />
      <div className="video-bg__overlay" />

      {/* 播放器控件 */}
      <div
        className="video-bg__controls"
      >
        <p className="video-bg__title">《{currentFileName}》</p>
        <div className="video-bg__buttons">
          <button onClick={prevVideo} title="上一曲"><SkipBack size={16} /></button>
          <button onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextVideo} title="下一曲"><SkipForward size={16} /></button>
        </div>
        <div className="video-bg__volume">
          <button onClick={toggleMute} title={isMuted ? '取消静音' : '静音'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
          />
        </div>
      </div>
    </div>
  );
}
