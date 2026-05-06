import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag } from 'lucide-react';
import { cn } from '../../utils/cn';

const items = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Produtos' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Pedidos' },
];

export function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
          Painel administrativo
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">QuickOrder Admin</h1>
      </div>

      <nav className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand-500 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
