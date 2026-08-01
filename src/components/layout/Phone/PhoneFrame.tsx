import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PhoneFrameProps {
  expanded: boolean;
  onHeadClick: () => void;
  children: ReactNode;
  wallpaper?: string | null;
}

export function PhoneFrame({ expanded, onHeadClick, children, wallpaper }: PhoneFrameProps) {
  return (
    <motion.div
      initial={{ y: '88%' }}
      animate={{ y: expanded ? '0%' : '88%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      onClick={!expanded ? onHeadClick : undefined}
      className="absolute bottom-0 left-0 right-0 z-50 mx-auto"
      style={{
        width: '304px',
        height: '592px',
        cursor: expanded ? 'default' : 'pointer',
      }}
      aria-label={expanded ? undefined : '打开手机'}
      role={expanded ? undefined : 'button'}
      tabIndex={expanded ? undefined : 0}
      onKeyDown={!expanded ? (e) => { if (e.key === 'Enter') onHeadClick(); } : undefined}
    >
      {/* ── 左侧音量键 ── */}
      <div
        className="absolute -left-[6px] top-[100px] w-[6px] h-[28px] rounded-l-md"
        style={{
          background: 'linear-gradient(180deg, #4a4a4e 0%, #2a2a2e 30%, #1c1c1e 70%, #3a3a3e 100%)',
          boxShadow: '-2px 1px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />
      <div
        className="absolute -left-[6px] top-[140px] w-[6px] h-[48px] rounded-l-md"
        style={{
          background: 'linear-gradient(180deg, #4a4a4e 0%, #2a2a2e 30%, #1c1c1e 70%, #3a3a3e 100%)',
          boxShadow: '-2px 1px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />
      <div
        className="absolute -left-[6px] top-[84px] w-[6px] h-[14px] rounded-l-sm"
        style={{
          background: 'linear-gradient(180deg, #55555a 0%, #2a2a2e 50%, #3a3a3e 100%)',
          boxShadow: '-2px 0 3px rgba(0,0,0,0.4)',
        }}
      />

      {/* ── 右侧电源键 ── */}
      <div
        className="absolute -right-[6px] top-[124px] w-[6px] h-[64px] rounded-r-md"
        style={{
          background: 'linear-gradient(180deg, #4a4a4e 0%, #2a2a2e 30%, #1c1c1e 70%, #3a3a3e 100%)',
          boxShadow: '2px 1px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />

      {/* ── 深色钛金属外壳 ── */}
      <div
        className="w-full h-full rounded-[48px] p-[4px] flex flex-col relative"
        style={{
          background: `
            linear-gradient(160deg,
              #48484d 0%,
              #2c2c30 12%,
              #3e3e42 25%,
              #1a1a1d 42%,
              #323236 58%,
              #1e1e22 75%,
              #38383c 88%,
              #2a2a2e 100%
            )
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(255,255,255,0.07),
            inset 0 1px 3px rgba(255,255,255,0.04),
            0 -6px 28px rgba(0,0,0,0.5),
            0 0 0 1px rgba(0,0,0,0.35),
            0 4px 12px rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* 天线带 - 顶部 */}
        <div
          className="absolute top-3 left-[30px] w-5 h-[2px] rounded-full"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        />
        <div
          className="absolute top-3 right-[30px] w-5 h-[2px] rounded-full"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        />

        {/* ── 黑色前面板 ── */}
        <div
          className="flex-1 rounded-[44px] p-[8px] flex flex-col relative overflow-hidden"
          style={{
            background: '#080808',
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.06),
              inset 0 0 8px rgba(0,0,0,0.5)
            `,
          }}
        >
          {/* Dynamic Island 刘海 */}
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-30">
            <div
              className="h-[26px] w-[82px] rounded-full flex items-center justify-center gap-2"
              style={{
                background: '#050505',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="w-[46px] h-[9px] rounded-full"
                style={{
                  background: '#0d0d0d',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              />
              <div
                className="w-[7px] h-[7px] rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #1a1a22 0%, #080810 70%, #000 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 2px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          </div>

          {/* 屏幕显示区 */}
          <div
            className="flex-1 rounded-[36px] relative overflow-hidden"
            style={{
              background: wallpaper
                ? `url(${wallpaper}) center/cover no-repeat`
                : '#FAF6F1',
              boxShadow: wallpaper
                ? 'inset 0 0 0 1px rgba(0,0,0,0.08), inset 0 0 32px rgba(0,0,0,0.15)'
                : 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 16px rgba(0,0,0,0.04)',
            }}
          >
            <div className="relative z-10 h-full">{children}</div>
          </div>

          {/* 底部 Home 指示条 */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-30">
            <div
              className="w-[108px] h-[4px] rounded-full"
              style={{
                background: 'rgba(255,255,255,0.20)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
