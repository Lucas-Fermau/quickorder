import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { ordersApi } from '../services/orders';
import type { Order } from '../types';
import { PAYMENT_LABELS } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { OrderStatusTracker } from '../components/order/OrderStatusTracker';
import { formatDate, formatPrice } from '../utils/cn';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .myOrders()
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Meus pedidos</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Acompanhe o status dos seus pedidos em tempo real.
      </p>

      <div className="mt-6">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Você ainda não fez pedidos"
            description="Quando você fizer um pedido, ele aparece aqui."
            action={
              <Link to="/">
                <Button>Ver cardápio</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Pedido #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tracking-tight tabular-nums">
                      {formatPrice(order.finalTotal)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {PAYMENT_LABELS[order.paymentMethod]}
                    </p>
                  </div>
                </div>

                <OrderStatusTracker status={order.status} />

                <details className="group mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <summary className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                    Ver itens ({order.items.length})
                  </summary>
                  <ul className="space-y-2 px-4 pb-4 pt-2">
                    {order.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-center gap-3 text-sm"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <span className="flex-1 truncate">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
