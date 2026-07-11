// ============================================================
// AvatarImg — 统一头像组件
// 根据角色名自动匹配 public/juesetouxiang/ 中的同名图片
// 加载失败时回退到默认占位头像
// ============================================================
import { useState } from 'react';
import { User } from 'lucide-react';

/** 根据名称生成 juesetouxiang 头像路径 */
export function getAvatarSrc(name: string): string {
  return `/juesetouxiang/${encodeURIComponent(name)}.png`;
}

export const DEFAULT_AVATAR_SRC = '/juesetouxiang/_default.png';

interface AvatarImgProps {
  /** 角色名（用于匹配 juesetouxiang 图片） */
  name?: string;
  /** 直接指定 URL（优先级高于 name） */
  src?: string;
  /** CSS class */
  className?: string;
  /** 尺寸 */
  size?: number;
  /** 回退图标颜色 */
  fallbackColor?: string;
}

export function AvatarImg({ name, src, className, size = 48, fallbackColor = '#c4b5a5' }: AvatarImgProps) {
  const [failed, setFailed] = useState(false);

  // 优先使用直接 src，其次根据 name 生成
  const imgSrc = src || (name ? getAvatarSrc(name) : DEFAULT_AVATAR_SRC);

  if (failed && !src && name) {
    // name 方式失败 → 先尝试默认图
    return (
      <AvatarImg
        src={DEFAULT_AVATAR_SRC}
        className={className}
        size={size}
        fallbackColor={fallbackColor}
      />
    );
  }

  if (failed) {
    // 完全失败 → 显示占位图标
    return (
      <div
        className={className}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.1)', width: size, height: size,
        }}
      >
        <User size={size * 0.5} color={fallbackColor} />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={name ?? ''}
      className={className}
      onError={() => setFailed(true)}
      style={{ objectFit: 'cover', width: size, height: size }}
    />
  );
}
