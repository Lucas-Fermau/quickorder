import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi } from '../services/orders';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { PAYMENT_LABELS, type PaymentMethod } from '../types';
import { cn, formatPrice } from '../utils/cn';
import { toast } from '../hooks/useToast';
import { ApiError } from '../services/api';

const schema = z.object({
  street: z.string().min(2, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Informe o bairro'),
  city: z.string().min(2, 'Informe a cidade'),
  zipCode: z.string().min(8, 'CEP inválido'),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const paymentMethods: Array<{ key: PaymentMethod; icon: typeof CreditCard }> = [
  { key: 'pix', icon: Smartphone },
  { key: 'credit_card', icon: CreditCard },
  { key: 'debit_card', icon: CreditCard },
  { key: 'cash', icon: Banknote },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const couponCode = (location.state as { couponCode?: string } | null)?.couponCode;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    setSubmitting(true);
    try {
      const { order } = await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        address: {
          street: values.street,
          number: values.number,
          complement: values.complement,
          neighborhood: values.neighborhood,
          city: values.city,
          zipCode: values.zipCode,
        },
        notes: values.notes,
        couponCode,
      });
      clear();
      toast.success('Pedido confirmado!');
      navigate('/my-orders', { state: { highlight: order.id } });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao criar pedido');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Finalizar pedido</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Endereço de entrega</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Rua" {...register('street')} error={errors.street?.message} placeholder="Av. Paulista" />
              </div>
              <Input label="Número" {...register('number')} error={errors.number?.message} placeholder="1000" />
              <Input
                label="Complemento (opcional)"
                {...register('complement')}
                placeholder="Apto 42"
              />
              <Input
                label="Bairro"
                {...register('neighborhood')}
                error={errors.neighborhood?.message}
                placeholder="Bela Vista"
              />
              <Input label="Cidade" {...register('city')} error={errors.city?.message} placeholder="São Paulo" />
              <div className="sm:col-span-2">
                <Input label="CEP" {...register('zipCode')} error={errors.zipCode?.message} placeholder="01310-100" />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Forma de pagamento</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {paymentMethods.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all',
                    paymentMethod === key
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{PAYMENT_LABELS[key]}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              * Pagamento simulado para fins de portfólio.
            </p>
          </section>

          {/* Notes */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Observações</h2>
            <Textarea
              {...register('notes')}
              rows={3}
              placeholder="Sem cebola, troco para R$ 100..."
            />
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-20">
          <h2 className="text-lg font-bold tracking-tight">Seu pedido</h2>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-2 py-2">
                <span className="line-clamp-1">
                  {item.quantity}× {item.name}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {couponCode ? (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Cupom aplicado: <strong>{couponCode}</strong>
              </p>
            ) : null}
          </div>
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            <CheckCircle2 className="h-4 w-4" />
            Confirmar pedido
          </Button>
        </aside>
      </form>
    </div>
  );
}
