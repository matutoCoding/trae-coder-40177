import { PRESCRIPTION_STATUS_MAP, FOLLOW_UP_RESULT_MAP, getRemainingDaysInfo } from '@/utils/constants';
import type { PrescriptionStatus, FollowUpResult } from '@/types';
import { cn } from '@/lib/utils';

type BadgeType = 'prescription' | 'followup' | 'remaining' | 'category';

interface StatusBadgeProps {
  type: BadgeType;
  status?: PrescriptionStatus | FollowUpResult | string;
  days?: number;
  category?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ type, status, days = 0, category, size = 'md', className }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (type === 'prescription' && status) {
    const info = PRESCRIPTION_STATUS_MAP[status as PrescriptionStatus];
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          info.bgColor,
          info.color,
          sizeClasses,
          className
        )}
      >
        {info.label}
      </span>
    );
  }

  if (type === 'followup' && status) {
    const info = FOLLOW_UP_RESULT_MAP[status as FollowUpResult];
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          info.bgColor,
          info.color,
          sizeClasses,
          className
        )}
      >
        {info.label}
      </span>
    );
  }

  if (type === 'remaining') {
    const info = getRemainingDaysInfo(days);
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-semibold',
          info.bgColor,
          info.color,
          sizeClasses,
          className
        )}
      >
        剩余 {info.label}
      </span>
    );
  }

  return null;
}
