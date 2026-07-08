import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Battery } from 'lucide-react';

interface PhoneFrameProps {
  expanded: boolean;
  onHeadClick: () => void;
  children: ReactNode;
}

export function PhoneFrame({ expanded, onHeadClick, children }: PhoneFrameProps) {
  return (
    <>
      {/* 收起状态：扁平手机头部 */}
      {!expanded && (
        <motion.button
          type="button"
          onClick={onHeadClick}
          className="fixed bottom-0 right-0 z-50 w-72 h-10 phone-case flex items-center justify-center cursor-pointer"
          aria-label="打开手机"
        >
          <div className="w-20 h-1 rounded-full bg-white/30" />
          <div className="absolute right-4 flex items-center gap-2 text-white/70">
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </motion.button>
      )}

      {/* 完整手机 */}
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: expanded ? '0%' : '110%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 right-0 z-50 w-80 h-[560px] phone-case flex flex-col overflow-hidden"
      >
        {/* 顶部边框 / 可点击收起 */}
        <button
          type="button"
          onClick={onHeadClick}
          className="h-10 shrink-0 flex items-center justify-center border-b border-white/10 relative"
        >
          <div className="w-20 h-1 rounded-full bg-white/30" />
          <div className="absolute right-4 flex items-center gap-2 text-white/70">
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
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
