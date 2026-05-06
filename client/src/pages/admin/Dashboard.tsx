import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, DollarSign, Package } from 'lucide-react';
import { ordersApi } from '../../services/orders';
import type { AdminStats } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice } from '../../utils/cn';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .stats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total de pedidos',
      value: stats.totalOrders,
      icon: ShoppingBag,
      iconBg: 'bg-brand-100 dark:bg-brand-500/15',
      iconColor: 'text-brand-600 dark:text-brand-400',
    },
    {
      label: 'Pedidos pendentes',
      value: stats.pendingOrders,
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-500/15',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Total vendido',
      value: formatPrice(stats.totalSold),
      icon: DollarSign,
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Produtos cadastrados',
      value: stats.totalProducts,
      icon: Package,
      iconBg: 'bg-violet-100 dark:bg-violet-500/15',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
