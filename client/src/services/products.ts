import { apiFetch } from './api';
import type { Product, ProductCategory } from '../types';

export interface ListProductsParams {
  category?: ProductCategory;
  search?: string;
  featured?: boolean;
  available?: boolean;
}

export const productsApi = {
  list: (params?: ListProductsParams) =>
    apiFetch<{ products: Product[] }>('/products', { params: params as never }),
  getById: (id: string) => apiFetch<{ product: Product }>(`/products/${id}`),
  create: (data: Omit<Product, 'id' | 'createdAt'>) =>
    apiFetch<{ product: Product }>('/products/admin', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>) =>
    apiFetch<{ product: Product }>(`/products/admin/${id}`, { method: 'PUT', body: data }),
  remove: (id: string) =>
    apiFetch<void>(`/products/admin/${id}`, { method: 'DELETE' }),
};
