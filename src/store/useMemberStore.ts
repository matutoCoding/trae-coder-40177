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
  StatsFilter,
  PrescriptionStatus,
} from '@/types';
import { mockMembers } from '@/data/members';
import { mockPurchaseRecords } from '@/data/purchaseRecords';
import { mockPrescriptions } from '@/data/prescriptions';
import { mockFollowUps } from '@/data/followUps';
import { addDays, getTodayStr, formatDate } from '@/utils/dateUtils';

const STORAGE_KEY = 'pharmacy-reminder-store';

const STAFF_LIST = ['张营业员', '李营业员', '王营业员'];

type DrillStatus = 'pending' | 'completed' | 'all';

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
  getPeriodStats: (period: 'today' | 'week' | 'month', filter?: Partial<StatsFilter>) => {
    total: number;
    completed: number;
    rate: number;
  };
  getCategoryStats: (period: 'today' | 'week' | 'month', filter?: Partial<StatsFilter>) => {
    name: string;
    key: MemberCategory | 'all';
    count: number;
    completed: number;
    rate: number;
  }[];
  getStaffRanking: (period: 'today' | 'week' | 'month', filter?: Partial<StatsFilter>) => {
    name: string;
    count: number;
    completed: number;
    rate: number;
  }[];

  batchAssignStaff: (memberIds: string[], staffName: string) => void;
  batchUpdateNextFollowDate: (memberIds: string[], date: string) => void;
  reassignMember: (memberId: string, staffName: string) => void;

  statsFilter: StatsFilter;
  setStatsFilter: (filter: Partial<StatsFilter>) => void;
  getMembersByStatsFilter: (
    period: 'today' | 'week' | 'month',
    filter?: Partial<StatsFilter>,
    drillStatus?: DrillStatus
  ) => Member[];

  getBoardData: () => {
    data: {
      staff: string;
      overdue: Member[];
      today: Member[];
      upcoming: Member[];
      completed: Member[];
    }[];
    unassigned: Member[];
  };
}

const RESULT_LABEL_MAP: Record<FollowUpResult, string> = {
  connected: '已接通',
  no_answer: '未接通',
  not_needed: '暂不需要',
  purchased: '已到店购买',
};

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

const applyMemberFilter = (members: Member[], filter: Partial<StatsFilter>): Member[] => {
  let result = [...members];

  if (filter.staff && filter.staff !== 'all') {
    result = result.filter((m) => m.assignedTo === filter.staff);
  }

  if (filter.category && filter.category !== 'all') {
    result = result.filter((m) => m.category === filter.category);
  }

  if (filter.prescriptionStatus && filter.prescriptionStatus !== 'all') {
    result = result.filter((m) => m.prescriptionStatus === filter.prescriptionStatus);
  }

  return result;
};

const isCompletedInPeriod = (
  memberId: string,
  period: 'today' | 'week' | 'month',
  followUps: Record<string, FollowUpRecord[]>
): boolean => {
  const today = getTodayStr();
  if (period === 'today') {
    const records = followUps[memberId] || [];
    return records.some((f) => formatDate(f.followDate) === today);
  }
  const { start, end } = getDateRangeForPeriod(period);
  const records = followUps[memberId] || [];
  return records.some((f) => isDateInRange(f.followDate, start, end));
};

const defaultStatsFilter: StatsFilter = {
  staff: 'all',
  category: 'all',
  prescriptionStatus: 'all',
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
      statsFilter: defaultStatsFilter,

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
        return get().getPeriodStats('today');
      },

      batchAssignStaff: (memberIds, staffName) => {
        set((prev) => ({
          members: prev.members.map((m) =>
            memberIds.includes(m.id) ? { ...m, assignedTo: staffName } : m
          ),
        }));
      },

      batchUpdateNextFollowDate: (memberIds, date) => {
        set((prev) => ({
          members: prev.members.map((m) =>
            memberIds.includes(m.id) ? { ...m, nextFollowDate: date } : m
          ),
        }));
      },

      reassignMember: (memberId, staffName) => {
        set((prev) => ({
          members: prev.members.map((m) =>
            m.id === memberId ? { ...m, assignedTo: staffName } : m
          ),
        }));
      },

      setStatsFilter: (filter) =>
        set((prev) => ({
          statsFilter: { ...prev.statsFilter, ...filter },
        })),

      getMembersByStatsFilter: (period, filter = {}, drillStatus = 'all') => {
        const state = get();
        const { members, followUps } = state;
        const today = getTodayStr();

        let memberList: Member[];

        if (period === 'today') {
          memberList = members.filter(
            (m) => m.nextFollowDate <= today || m.followedToday
          );
        } else {
          const { start, end } = getDateRangeForPeriod(period);
          const periodMemberIds = new Set<string>();
          const allFollowUpsFlat = Object.values(followUps).flat();
          allFollowUpsFlat
            .filter((f) => isDateInRange(f.followDate, start, end))
            .forEach((f) => periodMemberIds.add(f.memberId));

          const todayReminderIds = new Set(
            members.filter((m) => m.nextFollowDate <= today || m.followedToday).map((m) => m.id)
          );

          const allIds = new Set([...periodMemberIds, ...todayReminderIds]);
          memberList = members.filter((m) => allIds.has(m.id));
        }

        memberList = applyMemberFilter(memberList, filter);

        if (drillStatus === 'completed') {
          memberList = memberList.filter((m) =>
            isCompletedInPeriod(m.id, period, followUps)
          );
        } else if (drillStatus === 'pending') {
          memberList = memberList.filter((m) =>
            !isCompletedInPeriod(m.id, period, followUps)
          );
        }

        return memberList;
      },

      getPeriodStats: (period, filter = {}) => {
        const state = get();
        const targetMembers = state.getMembersByStatsFilter(period, filter);
        const total = targetMembers.length;
        const completed = targetMembers.filter((m) =>
          isCompletedInPeriod(m.id, period, state.followUps)
        ).length;

        const safeTotal = Math.max(total, completed);
        const rate =
          safeTotal > 0
            ? Math.min(100, Math.round((completed / safeTotal) * 100))
            : 0;

        return { total: safeTotal, completed, rate };
      },

      getCategoryStats: (period, filter = {}) => {
        const state = get();

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

        return categories.map((cat) => {
          const catFilter = { ...filter, category: cat === 'all' ? filter.category : cat };
          const catMembers = state.getMembersByStatsFilter(period, catFilter);
          const count = catMembers.length;

          const completed = catMembers.filter((m) =>
            isCompletedInPeriod(m.id, period, state.followUps)
          ).length;

          const safeCount = Math.max(count, completed);
          const rate =
            safeCount > 0
              ? Math.min(100, Math.round((completed / safeCount) * 100))
              : 0;

          return { name: categoryNames[cat], key: cat, count: safeCount, completed, rate };
        });
      },

      getStaffRanking: (period, filter = {}) => {
        const state = get();
        const { followUps } = state;
        const { start, end } = getDateRangeForPeriod(period);

        const targetMembers = state.getMembersByStatsFilter(period, filter);
        const targetMemberIds = new Set(targetMembers.map((m) => m.id));

        const staffMap: Record<string, { memberSet: Set<string>; completedSet: Set<string> }> = {};

        STAFF_LIST.forEach((name) => {
          staffMap[name] = { memberSet: new Set(), completedSet: new Set() };
        });

        const allFollowUpsFlat = Object.values(followUps).flat();
        const periodFollowUps = allFollowUpsFlat.filter(
          (f) =>
            isDateInRange(f.followDate, start, end) && targetMemberIds.has(f.memberId)
        );

        periodFollowUps.forEach((f) => {
          if (staffMap[f.operator]) {
            staffMap[f.operator].memberSet.add(f.memberId);
            staffMap[f.operator].completedSet.add(f.memberId);
          }
        });

        return STAFF_LIST
          .map((name) => {
            const { memberSet, completedSet } = staffMap[name];
            const count = memberSet.size;
            const completed = completedSet.size;
            const safeCompleted = Math.min(completed, count);
            const rate =
              count > 0
                ? Math.min(100, Math.round((safeCompleted / count) * 100))
                : 0;
            return {
              name,
              count,
              completed: safeCompleted,
              rate,
            };
          })
          .sort((a, b) => b.count - a.count || b.completed - a.completed);
      },

      getBoardData: () => {
        const state = get();
        const { members } = state;
        const today = getTodayStr();
        const todayPlus7 = addDays(today, 7);

        const result = STAFF_LIST.map((staffName) => {
          const staffMembers = members.filter((m) => m.assignedTo === staffName);

          const overdue: Member[] = [];
          const todayList: Member[] = [];
          const upcoming: Member[] = [];
          const completed: Member[] = [];

          staffMembers.forEach((m) => {
            if (m.followedToday) {
              completed.push(m);
            } else if (m.nextFollowDate < today) {
              overdue.push(m);
            } else if (m.nextFollowDate === today) {
              todayList.push(m);
            } else if (m.nextFollowDate <= todayPlus7) {
              upcoming.push(m);
            }
          });

          overdue.sort((a, b) => a.remainingDays - b.remainingDays);
          todayList.sort((a, b) => a.remainingDays - b.remainingDays);
          upcoming.sort((a, b) => a.remainingDays - b.remainingDays);

          return { staff: staffName, overdue, today: todayList, upcoming, completed };
        });

        const unassigned = members.filter((m) => !m.assignedTo);
        unassigned.sort((a, b) => a.remainingDays - b.remainingDays);

        return { data: result, unassigned };
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        members: state.members,
        followUps: state.followUps,
        lastVisitDate: state.lastVisitDate,
        statsFilter: state.statsFilter,
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

export { STAFF_LIST };
