// ============================================================
// OpeningOrb — 开场光球动画
// 黑暗中呼吸闪光的光球，点击后触发回调
// ============================================================
import { motion } from 'framer-motion';

interface OpeningOrbProps {
  onClick: () => void;
}

export function OpeningOrb({ onClick }: OpeningOrbProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* 外圈光晕 — 呼吸缩放 */}
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,130,255,0.4) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* 中层光晕 */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,150,255,0.6) 0%, transparent 60%)',
          filter: 'blur(12px)',
        }}
      />
      {/* 核心光球 */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(160,120,255,0.7) 40%, rgba(80,40,200,0.3) 100%)',
          boxShadow: '0 0 60px rgba(140,100,255,0.6), 0 0 120px rgba(140,100,255,0.3), 0 0 200px rgba(100,60,220,0.15)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 内部高光 */}
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          filter: 'blur(2px)',
          position: 'absolute',
          top: 14, left: 14,
        }} />
      </motion.div>
      {/* 提示文字 */}
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '25%',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          userSelect: 'none',
        }}
      >
        点击光球开始
      </motion.p>
    </div>
  );
}
