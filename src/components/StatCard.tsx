import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'rose';
  className?: string;
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  rose: 'from-rose-500 to-rose-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'blue',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
      'relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md',
      className
    )}
    style={{ transition: 'all 0.3s ease' }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        {trend && trendValue && (
          <div className="mt-3 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
            {trend === 'neutral' && <Minus className="h-4 w-4 text-slate-400" />}
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
      {icon && (
        <div
          className={cn(
        'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
        colorMap[color]
      )}
        >
          {icon}
        </div>
      )}
    </div>
    <div
      className={cn(
        'absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r',
        colorMap[color]
      )}
    />
  </div>
);
}
