import type { MemberCategory, MemberLevel, PrescriptionStatus, FollowUpResult, FollowUpMethod } from '@/types';

export const CATEGORY_MAP: Record<MemberCategory, { label: string; color: string; bgColor: string }> = {
  hypertension: { label: '高血压', color: 'text-rose-700', bgColor: 'bg-rose-50 border-rose-200' },
  diabetes: { label: '糖尿病', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  lipid: { label: '降脂', color: 'text-sky-700', bgColor: 'bg-sky-50 border-sky-200' },
  other: { label: '其他', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200' },
};

export const MEMBER_LEVEL_MAP: Record<MemberLevel, { label: string; color: string }> = {
  normal: { label: '普通会员', color: 'text-slate-500' },
  silver: { label: '银卡会员', color: 'text-slate-400' },
  gold: { label: '金卡会员', color: 'text-amber-500' },
};

export const PRESCRIPTION_STATUS_MAP: Record<PrescriptionStatus, { label: string; color: string; bgColor: string }> = {
  valid: { label: '处方有效', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  expiring: { label: '即将到期', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  expired: { label: '处方过期', color: 'text-rose-700', bgColor: 'bg-rose-50 border-rose-200' },
};

export const FOLLOW_UP_RESULT_MAP: Record<FollowUpResult, { label: string; color: string; bgColor: string }> = {
  connected: { label: '已接通', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  no_answer: { label: '未接通', color: 'text-slate-600', bgColor: 'bg-slate-50 border-slate-200' },
  not_needed: { label: '暂不需要', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  purchased: { label: '已到店购买', color: 'text-sky-700', bgColor: 'bg-sky-50 border-sky-200' },
};

export const FOLLOW_UP_METHOD_MAP: Record<FollowUpMethod, { label: string; icon: string }> = {
  phone: { label: '电话', icon: 'phone' },
  sms: { label: '短信', icon: 'message-square' },
  visit: { label: '到店', icon: 'store' },
};

export const getRemainingDaysInfo = (days: number) => {
  if (days <= 0) {
    return { label: '已用完', color: 'text-rose-600', bgColor: 'bg-rose-100', urgency: 'high' };
  }
  if (days <= 3) {
    return { label: `${days}天`, color: 'text-rose-600', bgColor: 'bg-rose-100', urgency: 'high' };
  }
  if (days <= 7) {
    return { label: `${days}天`, color: 'text-amber-600', bgColor: 'bg-amber-100', urgency: 'medium' };
  }
  return { label: `${days}天`, color: 'text-emerald-600', bgColor: 'bg-emerald-100', urgency: 'low' };
};

export const getGenderLabel = (gender: 'male' | 'female'): string => {
  return gender === 'male' ? '男' : '女';
};
