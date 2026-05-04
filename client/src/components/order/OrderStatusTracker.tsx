import { Check, Clock, ChefHat, Bike, PackageCheck, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { OrderStatus } from '../../types';

const flow: Array<{ key: OrderStatus; label: string; icon: typeof Check }> = [
  { key: 'pending', label: 'Recebido', icon: Clock },
  { key: 'confirmed', label: 'Confirmado', icon: Check },
  { key: 'preparing', label: 'Preparando', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Saiu p/ entrega', icon: Bike },
  { key: 'delivered', label: 'Entregue', icon: PackageCheck },
];

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Pedido cancelado
          </p>
          <p className="text-xs text-red-600/80 dark:text-red-400/80">
            Este pedido foi cancelado.
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = flow.findIndex((s) => s.key === status);

  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-[500px] items-start justify-between gap-2 px-1">
        {flow.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const Icon = step.icon;

          return (
            <li key={step.key} className="relative flex flex-1 flex-col items-center">
              {idx < flow.length - 1 ? (
                <div
                  className={cn(
                    'absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4 h-0.5 transition-colors',
                    done || active
                      ? 'bg-gradient-to-r from-brand-500 to-amber-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                />
              ) : null}
              <div
                className={cn(
                  'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all',
                  done
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : active
                      ? 'border-brand-500 bg-white text-brand-600 ring-4 ring-brand-500/20 dark:bg-slate-900 dark:text-brand-400'
                      : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'mt-2 text-center text-xs font-medium',
                  active
                    ? 'text-brand-700 dark:text-brand-400'
                    : done
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-500 dark:text-slate-500'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
