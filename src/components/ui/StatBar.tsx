interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
}

export function StatBar({ label, value, max = 100, color = 'bg-accent-sunset', icon }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1.5 text-text-secondary">
          {icon && <span className="text-text-muted">{icon}</span>}
          <span>{label}</span>
        </div>
        <span className="font-mono text-text-primary">{value}/{max}</span>
      </div>
      <div className="h-2 bg-border-soft/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
