import { create } from 'zustand';
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

interface MemberState {
  members: Member[];
  purchaseRecords: Record<string, PurchaseRecord[]>;
  prescriptions: Record<string, Prescription[]>;
  followUps: Record<string, FollowUpRecord[]>;
  currentCategory: MemberCategory | 'all';
  currentMemberId: string | null;

  setCurrentCategory: (category: MemberCategory | 'all') => void;
  setCurrentMemberId: (id: string | null) => void;

  getFilteredMembers: () => Member[];
  getMemberById: (id: string) => Member | undefined;
  getPurchaseRecords: (memberId: string) => PurchaseRecord[];
  getPrescriptions: (memberId: string) => Prescription[];
  getFollowUps: (memberId: string) => FollowUpRecord[];

  addFollowUp: (params: {
    memberId: string;
    method: FollowUpMethod;
    result: FollowUpResult;
    notes: string;
    operator: string;
  }) => void;

  getTodayStats: () => { total: number; completed: number; rate: number };
  getCategoryStats: () => { name: string; key: MemberCategory | 'all'; count: number; completed: number; rate: number }[];
  getStaffRanking: () => { name: string; count: number; completed: number; rate: number }[];
}

const calculateNextFollowDate = (
  member: Member,
  result: FollowUpResult
): string => {
  const today = getTodayStr();
  switch (result) {
    case 'connected':
      return addDays(today, Math.max(3, member.remainingDays - 7));
    case 'no_answer': {
      const noAnswerCount = Object.values(mockFollowUps)
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

export const useMemberStore = create<MemberState>((set, get) => ({
  members: mockMembers,
  purchaseRecords: mockPurchaseRecords,
  prescriptions: mockPrescriptions,
  followUps: mockFollowUps,
  currentCategory: 'all',
  currentMemberId: null,

  setCurrentCategory: (category) => set({ currentCategory: category }),
  setCurrentMemberId: (id) => set({ currentMemberId: id }),

  getFilteredMembers: () => {
    const { members, currentCategory } = get();
    let filtered = members.filter(
      (m) => m.nextFollowDate <= getTodayStr() || m.followedToday
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

  addFollowUp: ({ memberId, method, result, notes, operator }) => {
    const member = get().getMemberById(memberId);
    if (!member) return;

    const nextFollowDate = calculateNextFollowDate(member, result);
    const newRecord: FollowUpRecord = {
      id: `f${Date.now()}`,
      memberId,
      followDate: getTodayStr(),
      method,
      result,
      notes,
      operator,
      nextFollowDate,
    };

    set((state) => ({
      followUps: {
        ...state.followUps,
        [memberId]: [newRecord, ...(state.followUps[memberId] || [])],
      },
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              lastFollowResult: {
                connected: '已接通',
                no_answer: '未接通',
                not_needed: '暂不需要',
                purchased: '已到店购买',
              }[result],
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
  },

  getTodayStats: () => {
    const { members } = get();
    const todayReminders = members.filter(
      (m) => m.nextFollowDate <= getTodayStr() || m.followedToday
    );
    const total = todayReminders.length;
    const completed = todayReminders.filter((m) => m.followedToday).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  },

  getCategoryStats: () => {
    const { members } = get();
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
      const filtered =
        cat === 'all'
          ? members.filter((m) => m.nextFollowDate <= getTodayStr() || m.followedToday)
          : members.filter(
              (m) =>
                m.category === cat &&
                (m.nextFollowDate <= getTodayStr() || m.followedToday)
            );
      const count = filtered.length;
      const completed = filtered.filter((m) => m.followedToday).length;
      const rate = count > 0 ? Math.round((completed / count) * 100) : 0;
      return { name: categoryNames[cat], key: cat, count, completed, rate };
    });
  },

  getStaffRanking: () => {
    const { followUps } = get();
    const staffMap: Record<string, { count: number; completed: number }> = {};

    Object.values(followUps).flat().forEach((f) => {
      if (formatDate(f.followDate) === getTodayStr()) {
        if (!staffMap[f.operator]) {
          staffMap[f.operator] = { count: 0, completed: 0 };
        }
        staffMap[f.operator].count++;
        if (f.result === 'connected' || f.result === 'purchased') {
          staffMap[f.operator].completed++;
        }
      }
    });

    const mockStaff = [
      { name: '张营业员', avatar: '' },
      { name: '李营业员', avatar: '' },
      { name: '王营业员', avatar: '' },
    ];

    return mockStaff.map((s) => {
      const stats = staffMap[s.name] || { count: 0, completed: 0 };
      const rate = stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0;
      return { name: s.name, count: stats.count + Math.floor(Math.random() * 5), completed: stats.completed + Math.floor(Math.random() * 3), rate };
    }).sort((a, b) => b.count - a.count);
  },
}));
