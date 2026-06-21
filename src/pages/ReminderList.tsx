import { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  List,
  UserPlus,
  CalendarDays,
  X,
  Check,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import CategoryTabs from '@/components/CategoryTabs';
import MemberCard from '@/components/MemberCard';
import FollowUpModal from '@/components/FollowUpModal';
import { useMemberStore } from '@/store/useMemberStore';
import type { MemberCategory, Member } from '@/types';
import { formatDateCN, getTodayStr, addDays } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const STAFF_LIST = ['张营业员', '李营业员', '王营业员'];
const DATE_OPTIONS = [
  { label: '明天', days: 1 },
  { label: '3天后', days: 3 },
  { label: '7天后', days: 7 },
  { label: '14天后', days: 14 },
];

export default function ReminderList() {
  const [activeCategory, setActiveCategory] = useState<MemberCategory | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [customDate, setCustomDate] = useState('');

  const { members, getTodayStats, hasFollowedToday, batchAssignStaff, batchUpdateNextFollowDate } =
    useMemberStore();

  const todayStats = getTodayStats();
  const today = getTodayStr();

  const filteredMembers = useMemo(() => {
    let list = members.filter(
      (m) => m.nextFollowDate <= today || m.followedToday
    );

    if (activeCategory !== 'all') {
      list = list.filter((m) => m.category === activeCategory);
    }

    list.sort((a, b) => {
      if (a.followedToday && !b.followedToday) return 1;
      if (!a.followedToday && b.followedToday) return -1;
      return a.remainingDays - b.remainingDays;
    });

    return list;
  }, [members, activeCategory, today]);

  const categoryCounts = useMemo(() => {
    const todayReminders = members.filter(
      (m) => m.nextFollowDate <= today || m.followedToday
    );
    return {
      all: todayReminders.length,
      hypertension: todayReminders.filter((m) => m.category === 'hypertension').length,
      diabetes: todayReminders.filter((m) => m.category === 'diabetes').length,
      lipid: todayReminders.filter((m) => m.category === 'lipid').length,
      other: todayReminders.filter((m) => m.category === 'other').length,
    };
  }, [members, today]);

  const handleQuickFollow = (member: Member) => {
    if (hasFollowedToday(member.id)) {
      return;
    }
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSelect = (memberId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleToggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedIds(new Set());
  };

  const handleBatchAssign = (staffName: string) => {
    const ids = Array.from(selectedIds);
    batchAssignStaff(ids, staffName);
    setShowAssignModal(false);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleBatchDate = (days?: number) => {
    let targetDate = '';
    if (days !== undefined) {
      targetDate = addDays(today, days);
    } else if (customDate) {
      targetDate = customDate;
    }
    if (!targetDate) return;

    const ids = Array.from(selectedIds);
    batchUpdateNextFollowDate(ids, targetDate);
    setShowDateModal(false);
    setCustomDate('');
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const pendingCount = filteredMembers.filter((m) => !m.followedToday).length;
  const completedCount = filteredMembers.filter((m) => m.followedToday).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">今日待提醒</h1>
              <p className="mt-1 text-sm text-slate-500">
                <Calendar className="mr-1 inline h-4 w-4" />
                {formatDateCN(new Date().toISOString())} · 共 {filteredMembers.length} 位会员需要跟进
              </p>
            </div>
            <button
              onClick={handleToggleSelectMode}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                selectMode
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <List className="h-4 w-4" />
              {selectMode ? '退出批量' : '批量操作'}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard
            title="待跟进"
            value={pendingCount}
            subtitle="今日待跟进会员"
            icon={<Bell className="h-6 w-6" />}
            color="amber"
          />
          <StatCard
            title="已完成"
            value={completedCount}
            subtitle="今日已跟进会员"
            icon={<CheckCircle2 className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="完成率"
            value={`${todayStats.rate}%`}
            subtitle="今日跟进完成率"
            icon={<TrendingUp className="h-6 w-6" />}
            color="blue"
          />
        </div>

        {selectMode && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all',
                  selectedIds.size === filteredMembers.length && filteredMembers.length > 0
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300 bg-white hover:border-blue-400'
                )}
              >
                {selectedIds.size === filteredMembers.length && filteredMembers.length > 0 && (
                  <Check className="h-3.5 w-3.5 text-white" />
                )}
              </button>
              <span className="text-sm font-medium text-slate-700">
                已选 <span className="text-blue-600">{selectedIds.size}</span> / {filteredMembers.length} 人
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignModal(true)}
                disabled={selectedIds.size === 0}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                  selectedIds.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400'
                )}
              >
                <UserPlus className="h-4 w-4" />
                分配跟进人
              </button>
              <button
                onClick={() => setShowDateModal(true)}
                disabled={selectedIds.size === 0}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                  selectedIds.size > 0
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400'
                )}
              >
                <CalendarDays className="h-4 w-4" />
                改下次跟进
              </button>
            </div>
          </div>
        )}

        <div className="mb-5">
          <CategoryTabs
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            counts={categoryCounts}
          />
        </div>

        <div className="space-y-3">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onQuickFollow={handleQuickFollow}
                selected={selectedIds.has(member.id)}
                onSelect={handleSelect}
                showCheckbox={selectMode}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
              <Clock className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">暂无待提醒会员</p>
            </div>
          )}
        </div>
      </div>

      <FollowUpModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
      />

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">批量分配跟进人</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="mb-4 text-sm text-slate-500">
                将 <span className="font-medium text-slate-700">{selectedIds.size}</span> 位会员分配给：
              </p>
              <div className="space-y-2">
                {STAFF_LIST.map((staff) => (
                  <button
                    key={staff}
                    onClick={() => handleBatchAssign(staff)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-white">
                      {staff.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{staff}</p>
                      <p className="text-xs text-slate-400">
                        当前负责{' '}
                        {members.filter((m) => m.assignedTo === staff).length} 位会员
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">修改下次跟进日期</h3>
              <button
                onClick={() => {
                  setShowDateModal(false);
                  setCustomDate('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="mb-4 text-sm text-slate-500">
                将 <span className="font-medium text-slate-700">{selectedIds.size}</span> 位会员的下次跟进日期设为：
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => handleBatchDate(opt.days)}
                    className="rounded-xl border border-slate-200 p-3 text-center transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
                  >
                    <p className="font-medium text-slate-900">{opt.label}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateCN(addDays(today, opt.days))}
                    </p>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 text-sm text-slate-500">自定义日期</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    onClick={() => handleBatchDate()}
                    disabled={!customDate}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      customDate
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    )}
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
