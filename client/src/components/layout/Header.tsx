import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, ChefHat, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../store/cartStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const itemCount = useCart((s) => s.itemCount());
  const openCart = useCart((s) => s.open);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 text-white shadow-md shadow-brand-500/30">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">QuickOrder</div>
            <div className="-mt-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
              Burger
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Cardápio</NavItem>
          {user ? <NavItem to="/my-orders">Meus pedidos</NavItem> : null}
          {user?.role === 'admin' ? <NavItem to="/admin">Admin</NavItem> : null}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <button
            onClick={openCart}
            aria-label="Abrir carrinho"
            className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  aria-label="Admin"
                  className="hidden rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:hidden"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              ) : null}
              <Link
                to="/my-orders"
                aria-label="Meus pedidos"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:hidden"
              >
                <Package className="h-4 w-4" />
              </Link>
              <div className="ml-1 hidden items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-800 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 lg:inline">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Sair"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        )
      }
    >
      {children}
    </NavLink>
  );
}
