import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantitySelector({ value, onChange, min = 1, max = 50, size = 'md' }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const sizes = size === 'sm' ? 'h-8 text-sm' : 'h-10 text-base';
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div className={`inline-flex items-stretch overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 ${sizes}`}>
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className={`${btnSize} flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <div className={`flex min-w-[40px] items-center justify-center font-semibold tabular-nums`}>
        {value}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className={`${btnSize} flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
