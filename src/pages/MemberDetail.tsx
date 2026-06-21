import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Store,
  MapPin,
  User,
  Calendar,
  Pill,
  FileText,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useMemberStore } from '@/store/useMemberStore';
import StatusBadge from '@/components/StatusBadge';
import ScriptPanel from '@/components/ScriptPanel';
import FollowUpModal from '@/components/FollowUpModal';
import {
  CATEGORY_MAP,
  MEMBER_LEVEL_MAP,
  getRemainingDaysInfo,
  FOLLOW_UP_METHOD_MAP,
  FOLLOW_UP_RESULT_MAP,
  getGenderLabel,
} from '@/utils/constants';
import { formatDateCN, getDaysDiff } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { FollowUpMethod, FollowUpResult } from '@/types';

const METHOD_FILTER_OPTIONS: { value: FollowUpMethod | 'all'; label: string }[] = [
  { value: 'all', label: '全部方式' },
  { value: 'phone', label: '电话' },
  { value: 'sms', label: '短信' },
  { value: 'visit', label: '到店' },
];

const RESULT_FILTER_OPTIONS: { value: FollowUpResult | 'all'; label: string }[] = [
  { value: 'all', label: '全部结果' },
  { value: 'connected', label: '已接通' },
  { value: 'no_answer', label: '未接通' },
  { value: 'not_needed', label: '暂不需要' },
  { value: 'purchased', label: '已到店购买' },
];

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState<FollowUpMethod | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<FollowUpResult | 'all'>('all');

  const fromStaff = searchParams.get('fromStaff');

  const {
    getMemberById,
    getPurchaseRecords,
    getPrescriptions,
    getFollowUps,
    hasFollowedToday,
  } = useMemberStore();

  const member = getMemberById(id || '');
  const purchaseRecords = getPurchaseRecords(id || '');
  const prescriptions = getPrescriptions(id || '');
  const allFollowUps = getFollowUps(id || '');
  const followedToday = member ? hasFollowedToday(member.id) : false;

  const filteredFollowUps = useMemo(() => {
    let list = [...allFollowUps];
    if (methodFilter !== 'all') {
      list = list.filter((f) => f.method === methodFilter);
    }
    if (resultFilter !== 'all') {
      list = list.filter((f) => f.result === resultFilter);
    }
    if (fromStaff) {
      list = list.filter((f) => f.operator === fromStaff);
    }
    return list;
  }, [allFollowUps, methodFilter, resultFilter, fromStaff]);

  const hasActiveFilter = methodFilter !== 'all' || resultFilter !== 'all' || !!fromStaff;

  if (!member) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">会员不存在</p>
      </div>
    );
  }

  const categoryInfo = CATEGORY_MAP[member.category];
  const levelInfo = MEMBER_LEVEL_MAP[member.memberLevel];
  const remainingInfo = getRemainingDaysInfo(member.remainingDays);
  const latestPrescription = prescriptions[0];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleFollow = () => {
    if (!followedToday) {
      setIsModalOpen(true);
    }
  };

  const prescriptionDaysLeft = latestPrescription
    ? getDaysDiff(latestPrescription.expireDate)
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-2xl font-medium text-white">
              {member.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{member.name}</h1>
                <span className={cn('text-sm font-medium', levelInfo.color)}>
                  {levelInfo.label}
                </span>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    categoryInfo.bgColor,
                    categoryInfo.color
                  )}
                >
                  {categoryInfo.label}
                </span>
                {member.assignedTo && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    负责人：{member.assignedTo}
                  </span>
                )}
                {followedToday && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                    今日已完成
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">性别年龄</p>
                  <p className="font-medium text-slate-700">
                    {getGenderLabel(member.gender)} · {member.age}岁
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">手机号码</p>
                  <p className="font-medium text-slate-700">{member.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400">常用药品</p>
                  <p className="font-medium text-slate-700">{member.drugName}</p>
                </div>
                <div>
                  <p className="text-slate-400">上次联系</p>
                  <p className="font-medium text-slate-700">
                    {member.lastFollowResult}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div
                className={cn(
                  'rounded-xl px-5 py-3 text-center',
                  remainingInfo.bgColor
                )}
              >
                <p className="text-xs text-slate-500">预计剩余</p>
                <p className={cn('text-2xl font-bold', remainingInfo.color)}>
                  {member.remainingDays <= 0 ? '已用完' : `${member.remainingDays} 天`}
                </p>
              </div>
              <div className="flex gap-2">
                {followedToday ? (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    今日已完成跟进
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <Phone className="h-4 w-4" />
                      电话跟进
                    </button>
                    <button
                      onClick={handleFollow}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      短信提醒
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Pill className="h-5 w-5 text-blue-500" />
                  历史购药记录
                </h2>
                <span className="text-sm text-slate-400">
                  共 {purchaseRecords.length} 条记录
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />
                <div className="space-y-4">
                  {purchaseRecords.map((record, index) => (
                    <div key={record.id} className="relative flex gap-4 pl-10">
                      <div
                        className={cn(
                          'absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2',
                          index === 0
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-slate-200 bg-white'
                        )}
                      >
                        {index === 0 && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {record.drugName}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {record.boxes} 盒 · 药师：{record.pharmacist}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              ¥{record.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDateCN(record.purchaseDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="h-5 w-5 text-blue-500" />
                处方信息
              </h2>

              {latestPrescription ? (
                <div className="flex gap-5">
                  <div className="relative h-36 w-48 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={latestPrescription.imageUrl}
                      alt="处方照片"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <StatusBadge
                      type="prescription"
                      status={latestPrescription.status}
                      size="sm"
                      className="absolute right-2 top-2"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">开具医生</p>
                        <p className="font-medium text-slate-700">
                          {latestPrescription.doctorName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">开具医院</p>
                        <p className="font-medium text-slate-700">
                          {latestPrescription.hospital}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">开具日期</p>
                        <p className="font-medium text-slate-700">
                          {formatDateCN(latestPrescription.issueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">有效期至</p>
                        <p
                          className={cn(
                            'font-medium',
                            prescriptionDaysLeft <= 30
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          )}
                        >
                          {formatDateCN(latestPrescription.expireDate)}
                          <span className="ml-1 text-xs">
                            ({prescriptionDaysLeft > 0 ? `还剩${prescriptionDaysLeft}天` : '已过期'})
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-slate-400">医生备注</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {latestPrescription.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-400">暂无处方记录</p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Clock className="h-5 w-5 text-blue-500" />
                  跟进记录
                </h2>
                <span className="text-sm text-slate-400">
                  共 {filteredFollowUps.length} 条
                  {hasActiveFilter ? ` (筛选中)` : ''}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Filter className="h-3.5 w-3.5" />
                  筛选
                </div>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as FollowUpMethod | 'all')}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
                >
                  {METHOD_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value as FollowUpResult | 'all')}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
                >
                  {RESULT_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {fromStaff && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    {fromStaff}
                  </span>
                )}
                {hasActiveFilter && (
                  <button
                    onClick={() => {
                      setMethodFilter('all');
                      setResultFilter('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    重置
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredFollowUps.length > 0 ? (
                  filteredFollowUps.slice(0, 10).map((record) => {
                    const methodInfo = FOLLOW_UP_METHOD_MAP[record.method];
                    const resultInfo = FOLLOW_UP_RESULT_MAP[record.result];

                    return (
                      <div
                        key={record.id}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-4"
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                            resultInfo.bgColor
                          )}
                        >
                          {record.method === 'phone' && (
                            <Phone className={cn('h-4 w-4', resultInfo.color)} />
                          )}
                          {record.method === 'sms' && (
                            <MessageSquare
                              className={cn('h-4 w-4', resultInfo.color)}
                            />
                          )}
                          {record.method === 'visit' && (
                            <Store className={cn('h-4 w-4', resultInfo.color)} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-xs font-medium',
                                resultInfo.bgColor,
                                resultInfo.color
                              )}
                            >
                              {resultInfo.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {methodInfo.label} · {record.operator}
                            </span>
                            <span className="ml-auto text-xs text-slate-400">
                              {formatDateCN(record.followDate)}
                            </span>
                          </div>
                          {record.notes && (
                            <p className="mt-2 text-sm text-slate-600">
                              {record.notes}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-slate-400">
                            下次跟进：{formatDateCN(record.nextFollowDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400">
                    {hasActiveFilter ? '无匹配的跟进记录' : '暂无跟进记录'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <User className="h-5 w-5 text-blue-500" />
                联系方式
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    followedToday ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                  )}>
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">手机号码</p>
                    <p className="font-medium text-slate-700">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">紧急联系人</p>
                    <p className="font-medium text-slate-700">
                      {member.emergencyContact}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.emergencyPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">家庭地址</p>
                    <p className="text-sm text-slate-700">{member.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                提醒话术
              </h2>
              <ScriptPanel category={member.category} type="phone" />
            </div>

            {followedToday ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 font-medium text-white shadow-lg shadow-emerald-200">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                今日跟进已完成
              </div>
            ) : (
              <button
                onClick={handleFollow}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 font-medium text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300"
              >
                <Phone className="h-5 w-5" />
                开始跟进
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <FollowUpModal
        member={member}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
