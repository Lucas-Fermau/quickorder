import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ordersApi } from '../../services/orders';
import type { Order, OrderStatus } from '../../types';
import { STATUS_LABELS, PAYMENT_LABELS } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OrderStatusTracker } from '../../components/order/OrderStatusTracker';
import { formatDate, formatPrice } from '../../utils/cn';
import { toast } from '../../hooks/useToast';
import { ApiError } from '../../services/api';

const STATUS_FILTERS: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  preparing: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  out_for_delivery: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const reload = () => {
    setLoading(true);
    ordersApi
      .listAll()
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const updateStatus = async (order: Order, status: OrderStatus) => {
    try {
      const { order: updated } = await ordersApi.updateStatus(order.id, status);
      toast.success('Status atualizado');
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSelected(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Pedidos <span className="text-slate-500 dark:text-slate-400">({filtered.length})</span>
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Sem pedidos para esse filtro" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((order) => {
                const customer =
                  typeof order.userId === 'string'
                    ? order.userId
                    : `${order.userId.name}`;
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">{customer}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatPrice(order.finalTotal)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(order)}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Pedido #${selected?.id.slice(-6).toUpperCase() ?? ''}`}
        size="lg"
      >
        {selected ? (
          <div className="space-y-4">
            <OrderStatusTracker status={selected.status} />

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Cliente" value={typeof selected.userId === 'string' ? selected.userId : selected.userId.name} />
              <InfoRow label="Pagamento" value={PAYMENT_LABELS[selected.paymentMethod]} />
              <InfoRow label="Subtotal" value={formatPrice(selected.total)} />
              <InfoRow label="Desconto" value={formatPrice(selected.discount)} />
              <InfoRow label="Total final" value={formatPrice(selected.finalTotal)} />
              <InfoRow label="Cupom" value={selected.couponCode ?? '—'} />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/40">
              <p className="font-medium">Endereço</p>
              <p className="text-slate-600 dark:text-slate-400">
                {selected.address.street}, {selected.address.number}
                {selected.address.complement ? ` — ${selected.address.complement}` : ''}
                <br />
                {selected.address.neighborhood} · {selected.address.city} · CEP{' '}
                {selected.address.zipCode}
              </p>
            </div>

            {selected.notes ? (
              <div className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
                <p className="font-medium">Observações</p>
                <p className="text-slate-700 dark:text-slate-300">{selected.notes}</p>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-semibold">Itens</p>
              <ul className="space-y-2">
                {selected.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 text-sm">
                    <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                    <span className="flex-1">{item.quantity}× {item.name}</span>
                    <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <Select
                label="Atualizar status"
                value={selected.status}
                onChange={(e) => updateStatus(selected, e.target.value as OrderStatus)}
              >
                {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/40">
      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
