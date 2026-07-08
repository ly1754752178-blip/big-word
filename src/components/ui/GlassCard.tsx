import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode } from 'react';

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
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  return (
    <div className={cn(glassCardVariants({ variant }), className)}>
      {children}
    </div>
  );
}
