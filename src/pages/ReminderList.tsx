import { useState, useMemo } from 'react';
import { Bell, CheckCircle2, Clock, TrendingUp, Calendar } from 'lucide-react';
import StatCard from '@/components/StatCard';
import CategoryTabs from '@/components/CategoryTabs';
import MemberCard from '@/components/MemberCard';
import FollowUpModal from '@/components/FollowUpModal';
import { useMemberStore } from '@/store/useMemberStore';
import type { MemberCategory, Member } from '@/types';
import { formatDateCN } from '@/utils/dateUtils';

export default function ReminderList() {
  const [activeCategory, setActiveCategory] = useState<MemberCategory | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { members, getTodayStats, hasFollowedToday } = useMemberStore();

  const todayStats = getTodayStats();

  const filteredMembers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
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
  }, [members, activeCategory]);

  const categoryCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
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
  }, [members]);

  const handleQuickFollow = (member: Member) => {
    if (hasFollowedToday(member.id)) {
      return;
    }
    setSelectedMember(member);
    setIsModalOpen(true);
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
    </div>
  );
}
