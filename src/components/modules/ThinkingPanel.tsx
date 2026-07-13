import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

interface ThinkingPanelProps {
  content: string;
  isVisible: boolean;
}

export function ThinkingPanel({ content, isVisible }: ThinkingPanelProps) {
  return (
    <AnimatePresence>
      {isVisible && content && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="thinking-panel"
        >
          <div className="thinking-panel__header">
            <Brain size={14} />
            <span>思考过程</span>
          </div>
          <div className="thinking-panel__content">
            <p>{content}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
