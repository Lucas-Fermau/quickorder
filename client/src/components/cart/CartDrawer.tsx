import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { QuantitySelector } from './QuantitySelector';
import { EmptyState } from '../ui/EmptyState';
import { formatPrice } from '../../utils/cn';

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const goToCart = () => {
    close();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={close}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right dark:bg-slate-950">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-semibold tracking-tight">Seu carrinho</h2>
          </div>
          <button
            onClick={close}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Carrinho vazio"
              description="Adicione produtos do cardápio para começar."
            />
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-medium">{item.name}</h3>
                      <button
                        onClick={() => remove(item.productId)}
                        aria-label="Remover"
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-brand-600 dark:text-brand-400">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(q) => setQuantity(item.productId, q)}
                        size="sm"
                      />
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="border-t border-slate-200 p-5 dark:border-slate-800">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="text-xl font-bold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button onClick={goToCart} size="lg" className="w-full">
              Ver carrinho e finalizar
            </Button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
