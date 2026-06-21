import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  GripVertical,
  AlertTriangle,
  Clock,
  CalendarDays,
  CheckCircle2,
  UserPlus,
  User,
} from 'lucide-react';
import { useMemberStore, STAFF_LIST } from '@/store/useMemberStore';
import { CATEGORY_MAP } from '@/utils/constants';
import { formatDateCN, getTodayStr } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { Member } from '@/types';

type TimeGroup = 'overdue' | 'today' | 'upcoming' | 'completed';

const TIME_GROUP_CONFIG: Record<TimeGroup, { label: string; color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  overdue: { label: '逾期', color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-200', icon: AlertTriangle },
  today: { label: '今日', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', icon: Clock },
  upcoming: { label: '未来7天', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: CalendarDays },
  completed: { label: '已完成', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
};

function MemberChip({
  member,
  onDragStart,
  onClick,
}: {
  member: Member;
  onDragStart: (e: React.DragEvent, memberId: string) => void;
  onClick: (memberId: string) => void;
}) {
  const categoryInfo = CATEGORY_MAP[member.category];
  const group = member.followedToday
    ? 'completed'
    : member.nextFollowDate < getTodayStr()
    ? 'overdue'
    : member.nextFollowDate === getTodayStr()
    ? 'today'
    : 'upcoming';
  const config = TIME_GROUP_CONFIG[group];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, member.id)}
      onClick={() => onClick(member.id)}
      className={cn(
        'group flex items-center gap-2 rounded-lg border bg-white p-2.5 text-left transition-all cursor-grab active:cursor-grabbing',
        'hover:border-blue-300 hover:shadow-md',
        member.followedToday && 'opacity-60'
      )}
    >
      <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-slate-500" />
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-medium text-white">
        {member.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex rounded border px-1 py-0 text-[10px] font-medium leading-4',
              categoryInfo.bgColor,
              categoryInfo.color
            )}
          >
            {categoryInfo.label}
          </span>
          <span className={cn('text-[10px] font-medium', config.color)}>
            {member.remainingDays <= 0 ? '已用完' : `${member.remainingDays}天`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const navigate = useNavigate();
  const { getBoardData, reassignMember } = useMemberStore();
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const boardData = useMemo(() => getBoardData(), [getBoardData]);

  const handleDragStart = useCallback((e: React.DragEvent, memberId: string) => {
    setDraggedMemberId(memberId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', memberId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, staffName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(staffName);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, staffName: string) => {
      e.preventDefault();
      const memberId = e.dataTransfer.getData('text/plain') || draggedMemberId;
      if (memberId && staffName) {
        reassignMember(memberId, staffName);
        const memberName = useMemberStore.getState().getMemberById(memberId)?.name || '';
        setShowToast(`${memberName} 已转派给 ${staffName}`);
        setTimeout(() => setShowToast(null), 2500);
      }
      setDraggedMemberId(null);
      setDropTarget(null);
    },
    [draggedMemberId, reassignMember]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedMemberId(null);
    setDropTarget(null);
  }, []);

  const handleMemberClick = (memberId: string) => {
    navigate(`/member/${memberId}`);
  };

  const today = getTodayStr();

  const columns = [...boardData.data, { staff: '未分配', overdue: [], today: [], upcoming: [], completed: boardData.unassigned }];

  return (
    <div className="h-full overflow-hidden bg-slate-50">
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">跟进任务看板</h1>
              <p className="mt-1 text-sm text-slate-500">
                <Calendar className="mr-1 inline h-4 w-4" />
                {formatDateCN(new Date().toISOString())} · 拖动会员卡片到其他营业员名下即可转派
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-4 p-6" onDragOver={(e) => e.preventDefault()}>
            {columns.map((col) => {
              const isDropActive = dropTarget === col.staff;
              const totalCount =
                col.overdue.length + col.today.length + col.upcoming.length + col.completed.length;
              const pendingCount = col.overdue.length + col.today.length + col.upcoming.length;

              return (
                <div
                  key={col.staff}
                  onDragOver={(e) => handleDragOver(e, col.staff)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.staff)}
                  className={cn(
                    'flex h-full w-72 flex-shrink-0 flex-col rounded-2xl border-2 transition-colors',
                    isDropActive
                      ? 'border-blue-400 bg-blue-50/30'
                      : 'border-slate-200 bg-slate-50/80'
                  )}
                >
                  <div className="flex-shrink-0 rounded-t-2xl border-b border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-white">
                        {col.staff.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{col.staff}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>待跟进 {pendingCount}</span>
                          <span>·</span>
                          <span>已完成 {col.completed.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {(Object.keys(TIME_GROUP_CONFIG) as TimeGroup[]).map((group) => {
                      const members = col[group];
                      if (members.length === 0) return null;
                      const config = TIME_GROUP_CONFIG[group];
                      const Icon = config.icon;

                      return (
                        <div key={group}>
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Icon className={cn('h-3.5 w-3.5', config.color)} />
                            <span className={cn('text-xs font-semibold', config.color)}>
                              {config.label}
                            </span>
                            <span className="text-xs text-slate-400">({members.length})</span>
                          </div>
                          <div className="space-y-1.5">
                            {members.map((member) => (
                              <MemberChip
                                key={member.id}
                                member={member}
                                onDragStart={handleDragStart}
                                onClick={handleMemberClick}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {totalCount === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <User className="h-8 w-8 mb-2" />
                        <p className="text-xs">暂无跟进任务</p>
                      </div>
                    )}

                    {isDropActive && (
                      <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 p-4 text-center">
                        <UserPlus className="mx-auto h-6 w-6 text-blue-400" />
                        <p className="mt-1 text-xs font-medium text-blue-500">拖放到此处转派</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {showToast}
          </div>
        </div>
      )}
    </div>
  );
}
