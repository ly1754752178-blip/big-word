import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

// 动态扫描 public/videos/shipinbeijing 下所有 .mp4 和 .mp3 文件
const videoGlob = import.meta.glob('/public/videos/shipinbeijing/*.mp4', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const audioGlob = import.meta.glob('/public/videos/shipinbeijing/*.mp3', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

// 视频-音频配对
interface TrackPair {
  videoUrl: string;
  audioUrl: string;
  name: string; // 文件名（不含扩展名），用于显示和配对
}

// 构建视频-音频配对列表：文件名相同的 .mp4 和 .mp3 组成一对
function buildTrackPairs(): TrackPair[] {
  // 从 glob key 提取纯文件名（不含路径和扩展名）
  const extractName = (path: string): string => {
    const fileName = path.split('/').pop() ?? '';
    return fileName.replace(/\.[^/.]+$/, '');
  };

  // 建立 "文件名 → 音频URL" 映射
  const audioMap = new Map<string, string>();
  for (const [path, url] of Object.entries(audioGlob)) {
    audioMap.set(extractName(path), url);
  }

  // 为每个视频查找同名音频
  const pairs: TrackPair[] = [];
  for (const [path, videoUrl] of Object.entries(videoGlob)) {
    const name = extractName(path);
    const audioUrl = audioMap.get(name);
    if (audioUrl) {
      pairs.push({ videoUrl, audioUrl, name });
    } else {
      console.warn(`⚠️ 视频 "${name}" 缺少同名 MP3，跳过`);
    }
  }

  return pairs;
}

// Fisher-Yates 洗牌算法
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 伪随机洗牌：确保新列表首项 ≠ 上次末项，避免连续重复
function reshuffleAvoidRepeat<T>(arr: T[], lastItem: T): T[] {
  let result = shuffle(arr);
  if (result.length > 1 && result[0] === lastItem) {
    const insertPos = 1 + Math.floor(Math.random() * (result.length - 1));
    const [first] = result;
    result = [...result.slice(1, insertPos), first, ...result.slice(insertPos)];
  }
  return result;
}

// 跨页面保持静音状态
let persistentMuted = true;

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const switching = useRef(false);

  const [tracks, setTracks] = useState<TrackPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(persistentMuted);
  const [volume, setVolume] = useState(0.5);
  const [opacity, setOpacity] = useState(1);

  const tracksRef = useRef<TrackPair[]>([]);
  const idxRef = useRef(0);
  const mutedRef = useRef(true);
  const volRef = useRef(0.5);
  const lastItemRef = useRef<TrackPair | null>(null); // 上一轮最后一首，用于避重

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { idxRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { mutedRef.current = isMuted; persistentMuted = isMuted; }, [isMuted]);
  useEffect(() => { volRef.current = volume; }, [volume]);

  // ---- 初始化：动态扫描视频+音频，配对后洗牌 ----
  useEffect(() => {
    const pairs = buildTrackPairs();
    if (pairs.length === 0) {
      console.warn('⚠️ 未找到任何可用的视频-音频配对');
      return;
    }
    console.log(`📂 扫描到 ${Object.keys(videoGlob).length} 个视频, ${Object.keys(audioGlob).length} 个音频`);
    console.log(`🎵 配对成功 ${pairs.length} 组:`, pairs.map(p => p.name));
    const shuffled = shuffle(pairs);
    console.log(`🔀 洗牌完成，共 ${shuffled.length} 首，从索引 0 开始`);
    setTracks(shuffled);
    setCurrentIndex(0);
  }, []);

  // ---- 切换视频+音频：渐出 → 换源 → 渐入 ----
  const switchTrack = useCallback((nextIdx: number) => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v || !a || switching.current) return;
    switching.current = true;

    // 渐出
    setOpacity(0);
    setTimeout(() => {
      if (!v || !a) { switching.current = false; return; }
      // 暂停当前音频
      a.pause();
      // 换源
      const track = tracksRef.current[nextIdx];
      v.src = track.videoUrl;
      a.src = track.audioUrl;
      // 同时播放（视频永远静音，唯一声源为 MP3）
      v.muted = true;
      v.volume = 0;
      a.muted = mutedRef.current;
      a.volume = mutedRef.current ? 0 : volRef.current;
      v.play().catch(() => {});
      a.play().catch(() => { a.muted = true; a.play().catch(() => {}); });
      setCurrentIndex(nextIdx);
      setIsPlaying(true);
      // 渐入
      setTimeout(() => {
        setOpacity(1);
        switching.current = false;
      }, 200);
    }, 800);
  }, []);

  // ---- 下一首：遍历洗牌列表，播完一轮后重新洗牌 ----
  const goNextRef = useRef(() => {});
  goNextRef.current = () => {
    const total = tracksRef.current.length;
    if (total === 0) return;
    const cur = idxRef.current;

    if (cur >= total - 1) {
      // 本轮最后一首 → 重新洗牌，确保新首项 ≠ 旧末项
      const lastItem = tracksRef.current[cur];
      lastItemRef.current = lastItem;
      const reshuffled = reshuffleAvoidRepeat(tracksRef.current, lastItem);
      console.log(`🔄 一轮播完，重新洗牌。旧末项: ${lastItem.name}, 新首项: ${reshuffled[0].name}`);
      tracksRef.current = reshuffled;
      setTracks(reshuffled);
      switchTrack(0);
    } else {
      switchTrack(cur + 1);
    }
  };

  // ---- 上一首 ----
  const goPrevRef = useRef(() => {});
  goPrevRef.current = () => {
    const total = tracksRef.current.length;
    if (total === 0) return;
    const cur = idxRef.current;
    if (cur <= 0) {
      switchTrack(total - 1);
    } else {
      switchTrack(cur - 1);
    }
  };

  // ---- 初始加载：播放第一首 ----
  useEffect(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v || !a || tracks.length === 0 || switching.current) return;
    const track = tracks[currentIndex];
    v.src = track.videoUrl;
    a.src = track.audioUrl;
    v.muted = true;
    v.volume = 0;
    a.muted = true;
    a.volume = 0;
    v.play().catch(() => {});
    a.play().catch(() => {});
    setIsPlaying(true);
  }, [tracks]);

  // currentIndex 变化时切换
  useEffect(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v || !a || tracks.length === 0 || switching.current) return;
    if (v.src) {
      a.pause();
      const track = tracks[currentIndex];
      v.src = track.videoUrl;
      a.src = track.audioUrl;
      // 视频永远静音，唯一声源为 MP3
      v.muted = true;
      v.volume = 0;
      a.muted = mutedRef.current;
      a.volume = mutedRef.current ? 0 : volRef.current;
      v.play().catch(() => {});
      a.play().catch(() => { a.muted = true; a.play().catch(() => {}); });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // ---- 视频播完 → 循环（视频始终循环，直到 MP3 结束驱动切换） ----
  const handleVideoEnded = useCallback(() => {
    videoRef.current?.play();
  }, []);

  // ---- MP3 播完 → 立刻切下一首（核心切换触发器） ----
  const handleAudioEnded = useCallback(() => {
    goNextRef.current();
  }, []);

  // ---- 光球点击：解除静音（仅音频，视频永远静音） ----
  const unmuteRef = useRef(() => {
    const a = audioRef.current;
    if (a) { a.muted = false; a.volume = volRef.current; }
    setIsMuted(false);
  });
  unmuteRef.current = () => {
    const a = audioRef.current;
    if (a) { a.muted = false; a.volume = volRef.current; }
    setIsMuted(false);
  };
  useEffect(() => {
    const handler = () => unmuteRef.current();
    window.addEventListener('orb-clicked', handler);
    return () => window.removeEventListener('orb-clicked', handler);
  }, []);

  // ---- 控件 ----
  const togglePlay = () => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v || !a) return;
    if (v.paused) {
      v.play(); a.play();
      setIsPlaying(true);
    } else {
      v.pause(); a.pause();
      setIsPlaying(false);
    }
  };
  const prevTrack = () => { goPrevRef.current(); };
  const nextTrack = () => { goNextRef.current(); };
  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setIsMuted(!isMuted);
  };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const val = Number(e.target.value);
    setVolume(val); setIsMuted(false);
    a.volume = val; a.muted = false;
  };

  const currentTrack = tracks[currentIndex];
  const displayName = currentTrack ? decodeURIComponent(currentTrack.name) : '';

  return (
    <>
      {/* 视频层 */}
      <video
        ref={videoRef}
        muted
        playsInline preload="auto"
        onEnded={handleVideoEnded}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none',
          background: '#0a0a0a',
          opacity, transition: 'opacity 0.8s ease-in-out',
        }}
      />
      {/* 音频层（隐藏） */}
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={handleAudioEnded}
      />
      {/* 渐变遮罩 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none',
      }} />
      {/* 控件栏 */}
      <div style={ctrlBar}>
        <p style={ctrlTitle}>《{displayName}》</p>
        <div style={ctrlRow}>
          <button onClick={prevTrack} style={btn} title="上一曲"><SkipBack size={16} /></button>
          <button onClick={togglePlay} style={btn} title={isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextTrack} style={btn} title="下一曲"><SkipForward size={16} /></button>
        </div>
        <div style={ctrlRow}>
          <button onClick={toggleMute} style={btn} title={isMuted ? '取消静音' : '静音'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
            onChange={handleVolume} style={{ width: 60, accentColor: 'white' }} />
        </div>
      </div>
    </>
  );
}

const ctrlBar: React.CSSProperties = {
  position: 'fixed', top: 20, right: 20, zIndex: 9999,
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  padding: '12px 16px', borderRadius: 12,
  background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)',
};
const ctrlTitle: React.CSSProperties = { color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', margin: 0 };
const ctrlRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6 };
const btn: React.CSSProperties = {
  padding: 6, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 6,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
};
