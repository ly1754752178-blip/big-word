import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export function IconButton({ icon: Icon, label, active, onClick, className, id }: IconButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative flex items-center justify-center w-12 h-12 rounded-xl',
        'transition-all duration-200 ease-out',
        'hover:bg-white/60 active:scale-95',
        active && 'bg-accent-sunset/15 text-accent-sunset',
        className
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
