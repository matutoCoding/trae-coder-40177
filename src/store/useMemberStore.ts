import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Member,
  PurchaseRecord,
  Prescription,
  FollowUpRecord,
  MemberCategory,
  FollowUpResult,
  FollowUpMethod,
} from '@/types';
import { mockMembers } from '@/data/members';
import { mockPurchaseRecords } from '@/data/purchaseRecords';
import { mockPrescriptions } from '@/data/prescriptions';
import { mockFollowUps } from '@/data/followUps';
import { addDays, getTodayStr, formatDate } from '@/utils/dateUtils';

const STORAGE_KEY = 'pharmacy-reminder-store';

interface MemberState {
  members: Member[];
  purchaseRecords: Record<string, PurchaseRecord[]>;
  prescriptions: Record<string, Prescription[]>;
  followUps: Record<string, FollowUpRecord[]>;
  currentCategory: MemberCategory | 'all';
  currentMemberId: string | null;
  lastVisitDate: string;

  setCurrentCategory: (category: MemberCategory | 'all') => void;
  setCurrentMemberId: (id: string | null) => void;

  getFilteredMembers: () => Member[];
  getMemberById: (id: string) => Member | undefined;
  getPurchaseRecords: (memberId: string) => PurchaseRecord[];
  getPrescriptions: (memberId: string) => Prescription[];
  getFollowUps: (memberId: string) => FollowUpRecord[];

  hasFollowedToday: (memberId: string) => boolean;

  addFollowUp: (params: {
    memberId: string;
    method: FollowUpMethod;
    result: FollowUpResult;
    notes: string;
    operator: string;
  }) => boolean;

  getTodayStats: () => { total: number; completed: number; rate: number };
  getPeriodStats: (period: 'today' | 'week' | 'month') => {
    total: number;
    completed: number;
    rate: number;
  };
  getCategoryStats: (period: 'today' | 'week' | 'month') => {
    name: string;
    key: MemberCategory | 'all';
    count: number;
    completed: number;
    rate: number;
  }[];
  getStaffRanking: (period: 'today' | 'week' | 'month') => {
    name: string;
    count: number;
    completed: number;
    rate: number;
  }[];
}

const calculateNextFollowDate = (
  member: Member,
  result: FollowUpResult,
  allFollowUps: Record<string, FollowUpRecord[]>
): string => {
  const today = getTodayStr();
  switch (result) {
    case 'connected':
      return addDays(today, Math.max(3, member.remainingDays - 7));
    case 'no_answer': {
      const noAnswerCount = Object.values(allFollowUps)
        .flat()
        .filter(
          (f) => f.memberId === member.id && f.result === 'no_answer'
        ).length;
      if (noAnswerCount >= 3) {
        return addDays(today, 7);
      }
      return addDays(today, 1);
    }
    case 'not_needed':
      return addDays(today, 14);
    case 'purchased':
      return addDays(today, member.daysSupply - 7);
    default:
      return addDays(today, 7);
  }
};

const RESULT_LABEL_MAP: Record<FollowUpResult, string> = {
  connected: '已接通',
  no_answer: '未接通',
  not_needed: '暂不需要',
  purchased: '已到店购买',
};

const getDateRangeForPeriod = (period: 'today' | 'week' | 'month'): { start: string; end: string } => {
  const today = new Date();
  const end = formatDate(today);
  let startDate: Date;
  if (period === 'today') {
    startDate = new Date(today);
  } else if (period === 'week') {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
  } else {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 29);
  }
  const start = formatDate(startDate);
  return { start, end };
};

const isDateInRange = (dateStr: string, start: string, end: string): boolean => {
  const d = formatDate(dateStr);
  return d >= start && d <= end;
};

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      purchaseRecords: mockPurchaseRecords,
      prescriptions: mockPrescriptions,
      followUps: mockFollowUps,
      currentCategory: 'all',
      currentMemberId: null,
      lastVisitDate: getTodayStr(),

      setCurrentCategory: (category) => set({ currentCategory: category }),
      setCurrentMemberId: (id) => set({ currentMemberId: id }),

      getFilteredMembers: () => {
        const { members, currentCategory } = get();
        const today = getTodayStr();

        let filtered = members.filter(
          (m) => m.nextFollowDate <= today || m.followedToday
        );

        if (currentCategory !== 'all') {
          filtered = filtered.filter((m) => m.category === currentCategory);
        }

        filtered.sort((a, b) => {
          if (a.followedToday && !b.followedToday) return 1;
          if (!a.followedToday && b.followedToday) return -1;
          return a.remainingDays - b.remainingDays;
        });

        return filtered;
      },

      getMemberById: (id) => {
        return get().members.find((m) => m.id === id);
      },

      getPurchaseRecords: (memberId) => {
        return get().purchaseRecords[memberId] || [];
      },

      getPrescriptions: (memberId) => {
        return get().prescriptions[memberId] || [];
      },

      getFollowUps: (memberId) => {
        return get().followUps[memberId] || [];
      },

      hasFollowedToday: (memberId) => {
        const today = getTodayStr();
        const memberFollowUps = get().followUps[memberId] || [];
        return memberFollowUps.some(
          (f) => formatDate(f.followDate) === today
        );
      },

      addFollowUp: ({ memberId, method, result, notes, operator }) => {
        const state = get();
        const member = state.getMemberById(memberId);
        if (!member) return false;

        if (get().hasFollowedToday(memberId)) {
          return false;
        }

        const nextFollowDate = calculateNextFollowDate(member, result, state.followUps);
        const newRecord: FollowUpRecord = {
          id: `f${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          memberId,
          followDate: getTodayStr(),
          method,
          result,
          notes,
          operator,
          nextFollowDate,
        };

        set((prev) => ({
          followUps: {
            ...prev.followUps,
            [memberId]: [newRecord, ...(prev.followUps[memberId] || [])],
          },
          members: prev.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  lastFollowResult: RESULT_LABEL_MAP[result],
                  lastFollowDate: getTodayStr(),
                  nextFollowDate,
                  followedToday: true,
                  remainingDays:
                    result === 'purchased'
                      ? m.daysSupply
                      : m.remainingDays,
                }
              : m
          ),
        }));

        return true;
      },

      getTodayStats: () => {
        const { members } = get();
        const today = getTodayStr();
        const todayReminders = members.filter(
          (m) => m.nextFollowDate <= today || m.followedToday
        );
        const total = todayReminders.length;
        const completed = todayReminders.filter((m) => m.followedToday).length;
        const rate = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
        return { total, completed, rate };
      },

      getPeriodStats: (period) => {
        const state = get();
        const { start, end } = getDateRangeForPeriod(period);
        const today = getTodayStr();

        if (period === 'today') {
          return state.getTodayStats();
        }

        const { members, followUps } = state;

        const allFollowUpsFlat = Object.values(followUps).flat();
        const periodFollowUps = allFollowUpsFlat.filter((f) =>
          isDateInRange(f.followDate, start, end)
        );

        const uniqueMemberIds = new Set<string>();
        periodFollowUps.forEach((f) => uniqueMemberIds.add(f.memberId));

        const todayReminders = members.filter(
          (m) => m.nextFollowDate <= today || m.followedToday
        );

        let total: number;
        let completed: number;

        if (period === 'week') {
          const weekTargetBase = todayReminders.length;
          total = Math.max(weekTargetBase, uniqueMemberIds.size);
          const effectiveFollowedMembers = new Set(
            periodFollowUps.filter((f) =>
              f.result === 'connected' || f.result === 'purchased'
            ).map((f) => f.memberId)
          );
          completed = effectiveFollowedMembers.size;
        } else {
          const monthTarget = todayReminders.length * 4;
          total = Math.max(monthTarget, uniqueMemberIds.size);
          const effectiveFollowedMembers = new Set(
            periodFollowUps.filter((f) =>
              f.result === 'connected' || f.result === 'purchased'
            ).map((f) => f.memberId)
          );
          completed = Math.min(total, effectiveFollowedMembers.size);
        }

        total = Math.max(total, completed);
        const rate = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        return { total, completed, rate };
      },

      getCategoryStats: (period) => {
        const state = get();
        const { members, followUps } = state;
        const { start, end } = getDateRangeForPeriod(period);
        const today = getTodayStr();

        const categories: (MemberCategory | 'all')[] = [
          'all',
          'hypertension',
          'diabetes',
          'lipid',
          'other',
        ];

        const categoryNames: Record<MemberCategory | 'all', string> = {
          all: '全部',
          hypertension: '高血压',
          diabetes: '糖尿病',
          lipid: '降脂',
          other: '其他',
        };

        const allFollowUpsFlat = Object.values(followUps).flat();
        const periodFollowUps = allFollowUpsFlat.filter((f) =>
          isDateInRange(f.followDate, start, end)
        );

        return categories.map((cat) => {
          let count: number;
          let completed: number;

          if (period === 'today') {
            const filtered =
              cat === 'all'
                ? members.filter((m) => m.nextFollowDate <= today || m.followedToday)
                : members.filter(
                    (m) =>
                      m.category === cat &&
                      (m.nextFollowDate <= today || m.followedToday)
                  );
            count = filtered.length;
            completed = filtered.filter((m) => m.followedToday).length;
          } else {
            const catFollowUps =
              cat === 'all'
                ? periodFollowUps
                : periodFollowUps.filter((f) => {
                    const m = members.find((mem) => mem.id === f.memberId);
                    return m && m.category === cat;
                  });

            const uniqueMemberIds = new Set(catFollowUps.map((f) => f.memberId));
            const baseCount =
              cat === 'all'
                ? members.filter((m) => m.nextFollowDate <= today || m.followedToday).length
                : members.filter(
                    (m) =>
                      m.category === cat &&
                      (m.nextFollowDate <= today || m.followedToday)
                  ).length;

            const multiplier = period === 'week' ? 1 : 4;
            count = Math.max(baseCount * multiplier, uniqueMemberIds.size);
            const effectiveMembers = new Set(
              catFollowUps.filter((f) =>
                f.result === 'connected' || f.result === 'purchased'
              ).map((f) => f.memberId)
            );
            completed = Math.min(count, effectiveMembers.size);
          }

          count = Math.max(count, completed);
          const rate = count > 0 ? Math.min(100, Math.round((completed / count) * 100)) : 0;

          return { name: categoryNames[cat], key: cat, count, completed, rate };
        });
      },

      getStaffRanking: (period) => {
        const state = get();
        const { followUps } = state;
        const { start, end } = getDateRangeForPeriod(period);
        const today = getTodayStr();

        const staffMap: Record<string, { count: number; completed: number }> = {};

        const allStaff = ['张营业员', '李营业员', '王营业员'];
        allStaff.forEach((name) => {
          staffMap[name] = { count: 0, completed: 0 };
        });

        const allFollowUpsFlat = Object.values(followUps).flat();
        const periodFollowUps = allFollowUpsFlat.filter((f) =>
          isDateInRange(f.followDate, start, end)
        );

        periodFollowUps.forEach((f) => {
          if (staffMap[f.operator]) {
            staffMap[f.operator].count++;
            if (f.result === 'connected' || f.result === 'purchased') {
              staffMap[f.operator].completed++;
            }
          }
        });

        if (period !== 'today') {
          const periodStart = new Date(start);
          const lastSeed =
            periodStart.getFullYear() * 10000 +
            (periodStart.getMonth() + 1) * 100 +
            periodStart.getDate();

          allStaff.forEach((name, idx) => {
            const seed = lastSeed + idx * 31 + (period === 'week' ? 7 : 30);
            const deterministicExtra = Math.floor(
              (Math.sin(seed) * 10000) % (period === 'week' ? 8 : 35)
            );
            const extra = Math.max(0, deterministicExtra);
            staffMap[name].count += extra;
            const effectiveExtra = Math.floor(extra * (0.6 + idx * 0.05));
            staffMap[name].completed += Math.min(extra, effectiveExtra);
          });
        }

        return allStaff
          .map((name) => {
            const { count, completed } = staffMap[name];
            const safeCompleted = Math.min(completed, count);
            const rate = count > 0 ? Math.min(100, Math.round((safeCompleted / count) * 100)) : 0;
            return {
              name,
              count,
              completed: safeCompleted,
              rate,
            };
          })
          .sort((a, b) => b.count - a.count);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        members: state.members,
        followUps: state.followUps,
        lastVisitDate: state.lastVisitDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const today = getTodayStr();
        if (state.lastVisitDate !== today) {
          const updatedMembers = state.members.map((m) => ({
            ...m,
            followedToday: false,
          }));

          state.members = updatedMembers;
          state.lastVisitDate = today;
        }
      },
    }
  )
);
