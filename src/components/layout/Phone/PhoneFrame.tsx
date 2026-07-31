import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PhoneFrameProps {
  expanded: boolean;
  onHeadClick: () => void;
  children: ReactNode;
}

export function PhoneFrame({ expanded, onHeadClick, children }: PhoneFrameProps) {
  return (
    <>
      {/* 收起状态：底部横条 */}
      {!expanded && (
        <motion.button
          type="button"
          onClick={onHeadClick}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 h-10 flex items-center justify-center cursor-pointer"
          style={{ width: '288px' }}
          aria-label="打开手机"
        >
          <div className="w-20 h-1 rounded-full bg-white/30" />
        </motion.button>
      )}

      {/* 完整手机 */}
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: expanded ? '0%' : '110%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-50 mx-auto"
        style={{ width: '304px', height: '592px' }}
      >
        {/* 左侧按键 */}
        <div
          className="absolute -left-[3px] top-[92px] w-[3px] h-7 rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #d1d1d6 0%, #9e9ea4 50%, #d1d1d6 100%)' }}
        />
        <div
          className="absolute -left-[3px] top-[138px] w-[3px] h-12 rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #d1d1d6 0%, #9e9ea4 50%, #d1d1d6 100%)' }}
        />

        {/* 右侧电源键 */}
        <div
          className="absolute -right-[3px] top-[124px] w-[3px] h-16 rounded-r-sm"
          style={{ background: 'linear-gradient(180deg, #d1d1d6 0%, #9e9ea4 50%, #d1d1d6 100%)' }}
        />

        {/* 金属边框外壳 */}
        <div
          className="w-full h-full rounded-[48px] p-[8px] flex flex-col relative"
          style={{
            background: `
              linear-gradient(145deg, #f2f2f7 0%, #c8c8d0 18%, #e8e8ed 35%, #b0b0b8 55%, #f0f0f5 78%, #d0d0d8 100%)
            `,
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.7),
              inset 0 0 12px rgba(0,0,0,0.15),
              0 -8px 36px rgba(0,0,0,0.45),
              0 0 0 1px rgba(0,0,0,0.25)
            `,
          }}
        >
          {/* 天线带 */}
          <div className="absolute top-[68px] -left-[1px] w-[2px] h-2 bg-[#9e9ea4]/50" />
          <div className="absolute top-[68px] -right-[1px] w-[2px] h-2 bg-[#9e9ea4]/50" />

          {/* 黑色前面板 */}
          <div
            className="flex-1 rounded-[40px] bg-[#0a0a0a] p-[10px] flex flex-col relative overflow-hidden"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}
          >
            {/* 刘海 / Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
              <div
                className="h-7 w-[88px] rounded-full bg-black flex items-center justify-center gap-2"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
              >
                <div className="w-[52px] h-2.5 rounded-full bg-[#151515]" />
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #2a2a35 0%, #0f0f15 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                />
              </div>
            </div>

            {/* 屏幕区域 */}
            <div
              className="flex-1 rounded-[34px] bg-[#FAF6F1] relative overflow-hidden"
              style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}
            >
              <div className="relative z-10 h-full">{children}</div>
            </div>

            {/* 底部 Home 指示条 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30">
              <div className="w-28 h-[5px] rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
