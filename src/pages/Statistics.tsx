import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Medal,
  Users,
  CheckCircle2,
  Clock,
  Pill,
  ChevronDown,
  Filter,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useMemberStore } from '@/store/useMemberStore';
import { CATEGORY_MAP, PRESCRIPTION_STATUS_MAP } from '@/utils/constants';
import type { MemberCategory, PrescriptionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDateCN } from '@/utils/dateUtils';

type PeriodType = 'today' | 'week' | 'month';

const STAFF_OPTIONS = [
  { value: 'all', label: '全部营业员' },
  { value: '张营业员', label: '张营业员' },
  { value: '李营业员', label: '李营业员' },
  { value: '王营业员', label: '王营业员' },
];

const CATEGORY_OPTIONS: { value: MemberCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部类别' },
  { value: 'hypertension', label: '高血压' },
  { value: 'diabetes', label: '糖尿病' },
  { value: 'lipid', label: '降脂' },
  { value: 'other', label: '其他' },
];

const PRESCRIPTION_OPTIONS: { value: PrescriptionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部处方状态' },
  { value: 'valid', label: '处方有效' },
  { value: 'expiring', label: '即将到期' },
  { value: 'expired', label: '已过期' },
];

export default function Statistics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodType>('today');
  const {
    statsFilter,
    setStatsFilter,
    getPeriodStats,
    getCategoryStats,
    getStaffRanking,
  } = useMemberStore();

  const currentStats = getPeriodStats(period, statsFilter);
  const categoryStats = getCategoryStats(period, statsFilter);
  const staffRanking = getStaffRanking(period, statsFilter);

  const pendingCount = Math.max(0, currentStats.total - currentStats.completed);

  const periodLabels = {
    today: '今日',
    week: '本周',
    month: '本月',
  };

  const progressCircumference = 2 * Math.PI * 70;
  const progressOffset = progressCircumference - (currentStats.rate / 100) * progressCircumference;

  const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
  const medalBgColors = ['bg-amber-50', 'bg-slate-50', 'bg-amber-100/50'];

  const handleDrillDown = (extraFilter?: { staff?: string; category?: string }) => {
    const filter = { ...statsFilter, ...extraFilter };
    const params = new URLSearchParams();
    params.set('period', period);
    if (filter.staff !== 'all') params.set('staff', filter.staff as string);
    if (filter.category !== 'all') params.set('category', filter.category as string);
    if (filter.prescriptionStatus !== 'all')
      params.set('prescriptionStatus', filter.prescriptionStatus as string);
    navigate(`/members?${params.toString()}`);
  };

  const handleStaffClick = (staffName: string) => {
    handleDrillDown({ staff: staffName });
  };

  const handleCategoryClick = (catKey: string) => {
    handleDrillDown({ category: catKey });
  };

  const hasActiveFilter =
    statsFilter.staff !== 'all' ||
    statsFilter.category !== 'all' ||
    statsFilter.prescriptionStatus !== 'all';

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">数据统计</h1>
            <p className="mt-1 text-sm text-slate-500">
              <Calendar className="mr-1 inline h-4 w-4" />
              {formatDateCN(new Date().toISOString())} · {periodLabels[period]}跟进完成情况
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-white p-1 shadow-sm">
              {(['today', 'week', 'month'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium transition-all',
                    period === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4 text-blue-500" />
            筛选条件
          </div>

          <div className="relative">
            <select
              value={statsFilter.staff}
              onChange={(e) => setStatsFilter({ staff: e.target.value })}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {STAFF_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={statsFilter.category}
              onChange={(e) => setStatsFilter({ category: e.target.value as MemberCategory | 'all' })}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={statsFilter.prescriptionStatus}
              onChange={(e) =>
                setStatsFilter({
                  prescriptionStatus: e.target.value as PrescriptionStatus | 'all',
                })
              }
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {PRESCRIPTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {hasActiveFilter && (
            <button
              onClick={() =>
                setStatsFilter({
                  staff: 'all',
                  category: 'all',
                  prescriptionStatus: 'all',
                })
              }
              className="ml-auto text-sm text-blue-600 hover:text-blue-700"
            >
              重置筛选
            </button>
          )}
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <button
            onClick={() => handleDrillDown()}
            className="text-left"
          >
            <StatCard
              title={`${periodLabels[period]}待跟进`}
              value={pendingCount}
              subtitle={`${periodLabels[period]}剩余待跟进会员`}
              icon={<Users className="h-6 w-6" />}
              color="amber"
              clickable
            />
          </button>
          <button
            onClick={() => handleDrillDown()}
            className="text-left"
          >
            <StatCard
              title={`${periodLabels[period]}已完成`}
              value={currentStats.completed}
              subtitle={`${periodLabels[period]}已有效跟进`}
              icon={<CheckCircle2 className="h-6 w-6" />}
              color="green"
              clickable
            />
          </button>
          <button
            onClick={() => handleDrillDown()}
            className="text-left"
          >
            <StatCard
              title={`${periodLabels[period]}总数`}
              value={currentStats.total}
              subtitle={`${periodLabels[period]}目标跟进数`}
              icon={<Clock className="h-6 w-6" />}
              color="blue"
              clickable
            />
          </button>
          <button
            onClick={() => handleDrillDown()}
            className="text-left"
          >
            <StatCard
              title={`${periodLabels[period]}完成率`}
              value={`${currentStats.rate}%`}
              subtitle={`${periodLabels[period]}整体完成率`}
              icon={<TrendingUp className="h-6 w-6" />}
              color="blue"
              clickable
            />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              完成率仪表盘
            </h2>
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <svg width="180" height="180" className="-rotate-90">
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={progressCircumference}
                    strokeDashoffset={progressOffset}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">
                    {currentStats.rate}%
                  </span>
                  <span className="text-sm text-slate-500">完成率</span>
                </div>
              </div>
              <div className="mt-6 flex w-full gap-4 text-sm">
                <div className="flex-1 text-center">
                  <p className="text-slate-400">目标</p>
                  <p className="mt-1 font-semibold text-slate-700">85%</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-slate-400">已完成</p>
                  <p className="mt-1 font-semibold text-emerald-600">
                    {currentStats.completed}人
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-slate-400">剩余</p>
                  <p className="mt-1 font-semibold text-amber-600">
                    {pendingCount}人
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Pill className="h-5 w-5 text-blue-500" />
              分类统计
            </h2>
            <div className="space-y-4">
              {categoryStats
                .filter((c) => c.key !== 'all')
                .map((cat) => {
                  const categoryInfo = CATEGORY_MAP[cat.key as MemberCategory];
                  const barWidth = `${cat.rate}%`;
                  const catPending = Math.max(0, cat.count - cat.completed);

                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleCategoryClick(cat.key)}
                      className="w-full text-left transition-opacity hover:opacity-80"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                              categoryInfo?.bgColor,
                              categoryInfo?.color
                            )}
                          >
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-700">
                            {cat.completed}/{cat.count}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">
                            剩{catPending}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">
                            {cat.rate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700 ease-out',
                            cat.rate >= 80
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                              : cat.rate >= 50
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-rose-400 to-rose-500'
                          )}
                          style={{ width: barWidth }}
                        />
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {periodLabels[period]}到店转化率
                </span>
                <span className="text-lg font-bold text-emerald-600">
                  {categoryStats.find((c) => c.key === 'all')?.rate ?? 0}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                已接通会员中实际到店购买的比例
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Medal className="h-5 w-5 text-blue-500" />
              营业员排行
            </h2>
            <div className="space-y-3">
              {staffRanking.map((staff, index) => (
                <button
                  key={staff.name}
                  onClick={() => handleStaffClick(staff.name)}
                  className="w-full text-left"
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-slate-50',
                      index < 3 && 'bg-gradient-to-r from-slate-50 to-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold',
                        index < 3 ? medalBgColors[index] : 'bg-slate-100',
                        index < 3 ? medalColors[index] : 'text-slate-400'
                      )}
                    >
                      {index < 3 ? (
                        <Medal className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {staff.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <span>跟进 {staff.count} 人</span>
                        <span>·</span>
                        <span>有效 {staff.completed} 人</span>
                        <span>·</span>
                        <span>
                          剩{Math.max(0, staff.count - staff.completed)}人
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {staff.rate}%
                      </p>
                      <p className="text-xs text-slate-400">完成率</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3 text-center">
              <p className="text-sm text-slate-500">
                {periodLabels[period]}人均跟进{' '}
                <span className="font-semibold text-blue-600">
                  {Math.round(
                    staffRanking.reduce((sum, s) => sum + s.count, 0) /
                      Math.max(1, staffRanking.length)
                  )}
                </span>{' '}
                人
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            近7日跟进趋势
          </h2>
          <div className="flex h-48 items-end gap-2 px-2">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
              const heights = [65, 72, 58, 80, 75, 45, 30];
              const values = [26, 29, 23, 32, 30, 18, 12];
              const height = heights[index];
              const value = values[index];

              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">{value}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
