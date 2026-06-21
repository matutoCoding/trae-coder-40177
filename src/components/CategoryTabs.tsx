import { cn } from '@/lib/utils';
import { CATEGORY_MAP } from '@/utils/constants';
import type { MemberCategory } from '@/types';

interface CategoryTabsProps {
  activeCategory: MemberCategory | 'all';
  onChange: (category: MemberCategory | 'all') => void;
  counts?: Record<string, number>;
}

const categories: { key: MemberCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'hypertension', label: '高血压' },
  { key: 'diabetes', label: '糖尿病' },
  { key: 'lipid', label: '降脂药' },
  { key: 'other', label: '其他' },
];

export default function CategoryTabs({ activeCategory, onChange, counts }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.key;
        const count = counts?.[cat.key] ?? 0;
        const isAll = cat.key === 'all';

        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={cn(
              'relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : isAll
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : cn(
                    CATEGORY_MAP[cat.key as MemberCategory]?.bgColor,
                    CATEGORY_MAP[cat.key as MemberCategory]?.color,
                    'border',
                    'hover:shadow-sm'
                  )
            )}
          >
            <span>{cat.label}</span>
            {counts && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/60 text-slate-600'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
