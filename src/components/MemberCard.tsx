import { Phone, MessageSquare, ChevronRight, User } from 'lucide-react';
import type { Member } from '@/types';
import { CATEGORY_MAP, MEMBER_LEVEL_MAP, getRemainingDaysInfo } from '@/utils/constants';
import { formatDateCN } from '@/utils/dateUtils';
import StatusBadge from './StatusBadge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MemberCardProps {
  member: Member;
  onQuickFollow?: (member: Member) => void;
}

export default function MemberCard({ member, onQuickFollow }: MemberCardProps) {
  const navigate = useNavigate();
  const categoryInfo = CATEGORY_MAP[member.category];
  const levelInfo = MEMBER_LEVEL_MAP[member.memberLevel];
  const remainingInfo = getRemainingDaysInfo(member.remainingDays);

  const handleClick = () => {
    navigate(`/member/${member.id}`);
  };

  const handleQuickCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickFollow?.(member);
  };

  const handleQuickSms = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickFollow?.(member);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg',
        member.followedToday && 'opacity-70'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <User className="h-6 w-6" />
          </div>
          {member.followedToday && (
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {member.name}
            </h3>
            <span className={cn('text-xs font-medium', levelInfo.color)}>
              {levelInfo.label}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                categoryInfo.bgColor,
                categoryInfo.color
              )}
            >
              {categoryInfo.label}
            </span>
            <StatusBadge type="prescription" status={member.prescriptionStatus} size="sm" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">上次购药</p>
              <p className="font-medium text-slate-700">
                {formatDateCN(member.lastPurchaseDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">购买盒数</p>
              <p className="font-medium text-slate-700">{member.lastBoxes} 盒</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">预计剩余</p>
              <p className={cn('text-lg font-bold', remainingInfo.color)}>
                {member.remainingDays <= 0 ? '已用完' : `${member.remainingDays} 天`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">上次联系</p>
              <p className="text-sm font-medium text-slate-600">
                {member.lastFollowResult}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-blue-500" />
          <div className="flex gap-2">
            <button
              onClick={handleQuickCall}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
              title="拨打电话"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={handleQuickSms}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              title="发送短信"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
