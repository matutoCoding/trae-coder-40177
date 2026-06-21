import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { MemberCategory, FollowUpMethod } from '@/types';
import { getScriptsByTypeAndCategory } from '@/data/scripts';
import { cn } from '@/lib/utils';

interface ScriptPanelProps {
  category: MemberCategory;
  type: FollowUpMethod;
  compact?: boolean;
}

export default function ScriptPanel({ category, type, compact = false }: ScriptPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scripts = getScriptsByTypeAndCategory(type, category);

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (scripts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
        暂无话术模板
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', compact && 'max-h-40 overflow-y-auto')}>
      {scripts.map((script, index) => (
        <div
          key={index}
          className="group rounded-lg border border-slate-200 bg-slate-50/50 transition-all hover:border-blue-200 hover:bg-blue-50/30"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-medium text-slate-700">{script.title}</p>
            <button
              onClick={() => handleCopy(script.content, index)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white hover:text-blue-600"
            >
              {copiedIndex === index ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>复制</span>
                </>
              )}
            </button>
          </div>
          {!compact && (
            <div className="border-t border-slate-100 px-3 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {script.content}
              </p>
            </div>
          )}
          {compact && (
            <div className="border-t border-slate-100 px-3 py-2">
              <p className="line-clamp-2 text-xs text-slate-500">
                {script.content.replace(/\n/g, ' ')}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
