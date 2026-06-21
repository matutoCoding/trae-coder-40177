import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, Filter } from 'lucide-react';
import MemberCard from '@/components/MemberCard';
import { useMemberStore } from '@/store/useMemberStore';
import {
  CATEGORY_MAP,
  PRESCRIPTION_STATUS_MAP,
  FOLLOW_UP_RESULT_MAP,
} from '@/utils/constants';
import type { MemberCategory, PrescriptionStatus, FollowUpResult } from '@/types';
import { cn } from '@/lib/utils';

const PERIOD_LABELS: Record<string, string> = {
  today: '今日',
  week: '本周',
  month: '本月',
};

const DRILL_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待跟进', color: 'text-amber-600' },
  completed: { label: '已处理', color: 'text-emerald-600' },
  all: { label: '全部', color: 'text-slate-700' },
};

export default function MemberList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getMembersByStatsFilter } = useMemberStore();

  const period = (searchParams.get('period') as 'today' | 'week' | 'month') || 'today';
  const staff = searchParams.get('staff') || 'all';
  const category = (searchParams.get('category') as MemberCategory | 'all') || 'all';
  const prescriptionStatus =
    (searchParams.get('prescriptionStatus') as PrescriptionStatus | 'all') || 'all';
  const drillStatus = (searchParams.get('drillStatus') as 'pending' | 'completed' | 'all') || 'all';
  const operator = searchParams.get('operator') || 'all';
  const followUpResult =
    (searchParams.get('followUpResult') as FollowUpResult | 'all') || 'all';

  const members = useMemo(() => {
    return getMembersByStatsFilter(
      period,
      { staff, category, prescriptionStatus, operator, followUpResult },
      drillStatus
    );
  }, [getMembersByStatsFilter, period, staff, category, prescriptionStatus, drillStatus, operator, followUpResult]);

  const getFilterSummary = () => {
    const parts: string[] = [];
    if (staff !== 'all') parts.push(staff);
    if (operator !== 'all') parts.push(`跟进人:${operator}`);
    if (category !== 'all') parts.push(CATEGORY_MAP[category].label);
    if (prescriptionStatus !== 'all') parts.push(PRESCRIPTION_STATUS_MAP[prescriptionStatus].label);
    if (followUpResult !== 'all') parts.push(FOLLOW_UP_RESULT_MAP[followUpResult]?.label || followUpResult);
    return parts.length > 0 ? parts.join(' · ') : '全部';
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回统计
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">会员明细</h1>
              <p className="mt-1 text-sm text-slate-500">
                <Filter className="mr-1 inline h-4 w-4" />
                {PERIOD_LABELS[period]} · {getFilterSummary()} · 共 {members.length} 位会员
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                {members.length} 人
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">统计周期：</span>
              <span className="font-medium text-slate-700">{PERIOD_LABELS[period]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">营业员：</span>
              <span className="font-medium text-slate-700">
                {staff === 'all' ? '全部' : staff}
              </span>
            </div>
            {operator !== 'all' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">跟进人：</span>
                <span className="font-medium text-blue-600">{operator}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-500">用药类别：</span>
              <span className="font-medium text-slate-700">
                {category === 'all' ? '全部' : CATEGORY_MAP[category].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">处方状态：</span>
              <span className="font-medium text-slate-700">
                {prescriptionStatus === 'all'
                  ? '全部'
                  : PRESCRIPTION_STATUS_MAP[prescriptionStatus].label}
              </span>
            </div>
            {followUpResult !== 'all' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">跟进结果：</span>
                <span className="font-medium text-emerald-600">
                  {FOLLOW_UP_RESULT_MAP[followUpResult]?.label || followUpResult}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-500">跟进状态：</span>
              <span className={cn('font-medium', DRILL_STATUS_MAP[drillStatus]?.color)}>
                {DRILL_STATUS_MAP[drillStatus]?.label || '全部'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {members.length > 0 ? (
            members.map((member) => {
              const staffForDetail = operator !== 'all' ? operator : staff;
              const detailPath = staffForDetail !== 'all'
                ? `/member/${member.id}?fromStaff=${encodeURIComponent(staffForDetail)}`
                : `/member/${member.id}`;
              return (
                <MemberCard key={member.id} member={member} linkTo={detailPath} />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">暂无符合条件的会员</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
