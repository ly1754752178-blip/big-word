import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'surface' | 'raised' | 'elevated' | 'floating';
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const variantClassMap: Record<Required<GlassCardProps>['variant'], string> = {
  surface: 'card-tier-surface',
  raised: 'card-tier-raised',
  elevated: 'card-tier-elevated',
  floating: 'card-tier-floating',
};

export function GlassCard({ children, className, variant = 'raised', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        variantClassMap[variant],
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated',
        className
      )}
    >
      {children}
    </div>
  );
}
