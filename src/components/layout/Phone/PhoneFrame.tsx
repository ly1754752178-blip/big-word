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
      {/* 收起状态：简约横条 —— 在右侧面板内居中 */}
      {!expanded && (
        <motion.button
          type="button"
          onClick={onHeadClick}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 h-10 phone-case flex items-center justify-center cursor-pointer"
          style={{ width: '288px' }}
          aria-label="打开手机"
        >
          <div className="w-20 h-1 rounded-full bg-white/30" />
        </motion.button>
      )}

      {/* 完整手机 —— 在右侧面板内居中 */}
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: expanded ? '0%' : '110%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-50 phone-case flex flex-col overflow-hidden mx-auto"
        style={{ width: '288px', height: '560px' }}
      >
        {/* 顶部边框 / 可点击收起 */}
        <button
          type="button"
          onClick={onHeadClick}
          className="h-10 shrink-0 flex items-center justify-center border-b border-white/10 relative"
        >
          <div className="w-20 h-1 rounded-full bg-white/30" />
        </button>

        {/* 屏幕区域 */}
        <div className="flex-1 mx-3 mt-1 mb-3 phone-screen relative overflow-hidden">
          <div className="relative z-10 h-full">{children}</div>
        </div>

        {/* 底部 Home 指示条 */}
        <div className="h-5 shrink-0 flex items-center justify-center">
          <div className="w-24 h-1 rounded-full bg-white/30" />
        </div>
      </motion.div>
    </>
  );
}
