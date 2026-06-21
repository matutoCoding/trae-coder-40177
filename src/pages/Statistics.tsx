import { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Medal,
  Users,
  CheckCircle2,
  Clock,
  Pill,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useMemberStore } from '@/store/useMemberStore';
import { CATEGORY_MAP } from '@/utils/constants';
import type { MemberCategory } from '@/types';
import { cn } from '@/lib/utils';
import { formatDateCN } from '@/utils/dateUtils';

type PeriodType = 'today' | 'week' | 'month';

export default function Statistics() {
  const [period, setPeriod] = useState<PeriodType>('today');
  const { members, getTodayStats, getCategoryStats, getStaffRanking } = useMemberStore();

  const todayStats = getTodayStats();
  const categoryStats = getCategoryStats();
  const staffRanking = getStaffRanking();

  const weekStats = useMemo(() => {
    const total = members.length;
    const completed = members.filter((m) => m.followedToday).length + 15;
    return {
      total: total,
      completed,
      rate: Math.round((completed / total) * 100),
    };
  }, [members]);

  const monthStats = useMemo(() => {
    const total = members.length * 3;
    const completed = Math.round(total * 0.72);
    return {
      total,
      completed,
      rate: Math.round((completed / total) * 100),
    };
  }, [members]);

  const currentStats =
    period === 'today' ? todayStats : period === 'week' ? weekStats : monthStats;

  const periodLabels = {
    today: '今日',
    week: '本周',
    month: '本月',
  };

  const progressCircumference = 2 * Math.PI * 70;
  const progressOffset = progressCircumference - (currentStats.rate / 100) * progressCircumference;

  const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
  const medalBgColors = ['bg-amber-50', 'bg-slate-50', 'bg-amber-100/50'];

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">数据统计</h1>
            <p className="mt-1 text-sm text-slate-500">
              <Calendar className="mr-1 inline h-4 w-4" />
              {formatDateCN(new Date().toISOString())} · 跟进完成情况
            </p>
          </div>

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

        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            title="待跟进总数"
            value={currentStats.total}
            subtitle={`${periodLabels[period]}待跟进会员`}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="已完成"
            value={currentStats.completed}
            subtitle={`${periodLabels[period]}已跟进`}
            icon={<CheckCircle2 className="h-6 w-6" />}
            color="green"
            trend="up"
            trendValue="较上周期 +12%"
          />
          <StatCard
            title="未完成"
            value={currentStats.total - currentStats.completed}
            subtitle={`${periodLabels[period]}待跟进`}
            icon={<Clock className="h-6 w-6" />}
            color="amber"
            trend="down"
            trendValue="较上周期 -8%"
          />
          <StatCard
            title="完成率"
            value={`${currentStats.rate}%`}
            subtitle={`${periodLabels[period]}整体完成率`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="blue"
            trend="up"
            trendValue="较上周期 +5%"
          />
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
                    {currentStats.total - currentStats.completed}人
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

                  return (
                    <div key={cat.key}>
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
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">整体转化率</span>
                <span className="text-lg font-bold text-emerald-600">68.5%</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                已接通会员中，实际到店购买的比例
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
                <div
                  key={staff.name}
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
                      <span>完成 {staff.completed} 人</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {staff.rate}%
                    </p>
                    <p className="text-xs text-slate-400">完成率</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3 text-center">
              <p className="text-sm text-slate-500">
                今日人均跟进 <span className="font-semibold text-blue-600">8.5</span> 人
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
              const height = heights[index];

              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
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
