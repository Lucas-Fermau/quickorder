import { PRODUCT_CATEGORIES, type ProductCategory } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  value: ProductCategory | null;
  onChange: (next: ProductCategory | null) => void;
}

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <Pill active={value === null} onClick={() => onChange(null)}>
        Todos
      </Pill>
      {PRODUCT_CATEGORIES.map((cat) => (
        <Pill key={cat} active={value === cat} onClick={() => onChange(cat)}>
          {cat}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
        active
          ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/25'
          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
      )}
    >
      {children}
    </button>
  );
}
