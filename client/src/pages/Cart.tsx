import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Trash2, ArrowRight, Check } from 'lucide-react';
import { useCart } from '../store/cartStore';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { QuantitySelector } from '../components/cart/QuantitySelector';
import { formatPrice } from '../utils/cn';
import { toast } from '../hooks/useToast';

const COUPONS: Record<string, { label: string; calc: (subtotal: number) => number }> = {
  QUICK10: {
    label: '10% de desconto',
    calc: (s) => Math.round(s * 0.1 * 100) / 100,
  },
  PRIMEIRA: {
    label: '15% de desconto',
    calc: (s) => Math.round(s * 0.15 * 100) / 100,
  },
  FRETE20: {
    label: 'R$ 20 de desconto',
    calc: (s) => Math.min(20, s),
  },
};

export function CartPage() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const coupon = COUPONS[appliedCoupon];
    if (!coupon) return 0;
    return coupon.calc(subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(0, subtotal - discount);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (!COUPONS[code]) {
      toast.error('Cupom inválido');
      return;
    }
    setAppliedCoupon(code);
    toast.success(`Cupom aplicado: ${COUPONS[code].label}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const goToCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout', { state: { couponCode: appliedCoupon } });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState
          icon={ShoppingBag}
          title="Seu carrinho está vazio"
          description="Volte ao cardápio e escolha seus pratos favoritos."
          action={
            <Link to="/">
              <Button>Ver cardápio</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Seu carrinho</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {items.length} item{items.length > 1 ? 's' : ''} no carrinho
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 className="h-4 w-4" />
          Esvaziar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <button
                    onClick={() => remove(item.productId)}
                    aria-label="Remover"
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-brand-600 dark:text-brand-400">
                  {formatPrice(item.price)} · {item.preparationTime} min
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(q) => setQuantity(item.productId, q)}
                    size="sm"
                  />
                  <span className="font-bold tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-20">
          <h2 className="text-lg font-bold tracking-tight">Resumo</h2>

          {/* Coupon */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    {appliedCoupon}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400/80">
                    {COUPONS[appliedCoupon]?.label}
                  </div>
                </div>
              </div>
              <button
                onClick={removeCoupon}
                className="text-xs text-emerald-700 underline hover:no-underline dark:text-emerald-400"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Cupom"
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm uppercase placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950"
              />
              <Button onClick={applyCoupon} variant="outline" size="md">
                <Tag className="h-4 w-4" />
                Aplicar
              </Button>
            </div>
          )}

          <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {discount > 0 ? (
              <Row
                label="Desconto"
                value={`- ${formatPrice(discount)}`}
                tone="success"
              />
            ) : null}
            <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total
              </span>
              <span className="text-2xl font-bold tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Button onClick={goToCheckout} size="lg" className="w-full">
            Finalizar pedido
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
            <p className="font-medium">Cupons disponíveis:</p>
            <ul className="mt-1.5 space-y-0.5">
              <li><code className="font-semibold">QUICK10</code> — 10% off</li>
              <li><code className="font-semibold">PRIMEIRA</code> — 15% off</li>
              <li><code className="font-semibold">FRETE20</code> — R$ 20 off</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success';
}) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span
        className={`text-sm font-medium tabular-nums ${
          tone === 'success' ? 'text-emerald-600 dark:text-emerald-400' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
