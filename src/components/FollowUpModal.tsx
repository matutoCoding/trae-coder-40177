import { useState } from 'react';
import { X, Phone, MessageSquare, Store, Check } from 'lucide-react';
import type { Member, FollowUpResult, FollowUpMethod } from '@/types';
import { FOLLOW_UP_RESULT_MAP } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { useMemberStore } from '@/store/useMemberStore';
import ScriptPanel from './ScriptPanel';

interface FollowUpModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

const results: { key: FollowUpResult; icon: React.ReactNode; color: string }[] = [
  { key: 'connected', icon: <Phone className="h-5 w-5" />, color: 'emerald' },
  { key: 'no_answer', icon: <Phone className="h-5 w-5" />, color: 'slate' },
  { key: 'not_needed', icon: <MessageSquare className="h-5 w-5" />, color: 'amber' },
  { key: 'purchased', icon: <Store className="h-5 w-5" />, color: 'blue' },
];

const colorMap: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    hoverBg: 'hover:bg-emerald-100',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-700',
    hoverBg: 'hover:bg-slate-100',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-700',
    hoverBg: 'hover:bg-amber-100',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    hoverBg: 'hover:bg-blue-100',
  },
};

export default function FollowUpModal({ member, isOpen, onClose }: FollowUpModalProps) {
  const [selectedResult, setSelectedResult] = useState<FollowUpResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<FollowUpMethod>('phone');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const addFollowUp = useMemberStore((state) => state.addFollowUp);

  if (!isOpen || !member) return null;

  const handleSubmit = () => {
    if (!selectedResult) return;

    addFollowUp({
      memberId: member.id,
      method: selectedMethod,
      result: selectedResult,
      notes,
      operator: '张营业员',
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedResult(null);
      setNotes('');
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setSelectedResult(null);
    setNotes('');
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-slate-900">跟进记录已保存</p>
          <p className="text-sm text-slate-500">下次跟进日期已自动安排</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">跟进记录</h2>
            <p className="mt-0.5 text-sm text-slate-500">{member.name} · {member.phone}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-slate-700">跟进方式</p>
            <div className="flex gap-2">
              {(['phone', 'sms', 'visit'] as FollowUpMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                    selectedMethod === method
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {method === 'phone' && <Phone className="h-4 w-4" />}
                  {method === 'sms' && <MessageSquare className="h-4 w-4" />}
                  {method === 'visit' && <Store className="h-4 w-4" />}
                  {{ phone: '电话', sms: '短信', visit: '到店' }[method]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-slate-700">话术模板</p>
            <ScriptPanel category={member.category} type={selectedMethod} compact />
          </div>

          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-slate-700">跟进结果</p>
            <div className="grid grid-cols-2 gap-2">
              {results.map((result) => {
                const isSelected = selectedResult === result.key;
                const colors = colorMap[result.color];
                const resultInfo = FOLLOW_UP_RESULT_MAP[result.key];

                return (
                  <button
                    key={result.key}
                    onClick={() => setSelectedResult(result.key)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                      isSelected
                        ? cn(colors.bg, colors.border)
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        isSelected ? colors.bg : 'bg-slate-100',
                        isSelected ? colors.text : 'text-slate-500'
                      )}
                    >
                      {result.icon}
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-medium',
                          isSelected ? colors.text : 'text-slate-700'
                        )}
                      >
                        {resultInfo.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-slate-700">跟进备注</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="请输入跟进备注..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5">
          <button
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedResult}
            className={cn(
              'rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors',
              selectedResult
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'cursor-not-allowed bg-slate-300'
            )}
          >
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
}
