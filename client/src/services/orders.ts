import { apiFetch } from './api';
import type { Address, AdminStats, Order, OrderStatus, PaymentMethod } from '../types';

export interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: PaymentMethod;
  address: Address;
  notes?: string;
  couponCode?: string;
}

export const ordersApi = {
  create: (data: CreateOrderInput) =>
    apiFetch<{ order: Order }>('/orders', { method: 'POST', body: data }),
  myOrders: () => apiFetch<{ orders: Order[] }>('/orders/my-orders'),
  listAll: (status?: OrderStatus) =>
    apiFetch<{ orders: Order[] }>('/orders/admin', { params: { status } }),
  getById: (id: string) => apiFetch<{ order: Order }>(`/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    apiFetch<{ order: Order }>(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  stats: () => apiFetch<AdminStats>('/orders/admin/stats'),
};
