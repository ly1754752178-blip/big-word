interface StatBarProps {
  id?: string;
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
}

export function StatBar({ id, label, value, max = 100, color = '#0EA5E9', icon }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div id={id} className="space-y-1">
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span>{label}</span>
        </div>
        <span className="font-number text-slate-700">{value}/{max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
