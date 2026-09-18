import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode, type MouseEvent } from 'react';

const glassCardVariants = cva(
  'rounded-2xl border transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-white border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5',
        elevated: 'bg-white border-slate-100 shadow-soft-lg',
        floating: 'bg-white/90 backdrop-blur-md border-white/60 shadow-soft-lg',
        cream: 'bg-cream-50 border-cream-100 shadow-soft',
        sky: 'bg-sky-50 border-sky-100 shadow-soft',
        coral: 'bg-coral-50 border-coral-100 shadow-soft',
        mint: 'bg-mint-50 border-mint-100 shadow-soft',
        lavender: 'bg-lavender-50 border-lavender-100 shadow-soft',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface GlassCardProps extends VariantProps<typeof glassCardVariants> {
  id?: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({ id, children, className, variant = 'default', onClick }: GlassCardProps) {
  return (
    <div
      id={id}
      className={cn(glassCardVariants({ variant }), onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
