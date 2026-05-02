import { apiFetch } from './api';
import type { Product } from '../types';

interface FavoriteEntry {
  id: string;
  productId: Product;
  createdAt: string;
}

export const favoritesApi = {
  list: () => apiFetch<{ favorites: FavoriteEntry[] }>('/favorites'),
  add: (productId: string) =>
    apiFetch<unknown>(`/favorites/${productId}`, { method: 'POST' }),
  remove: (productId: string) =>
    apiFetch<void>(`/favorites/${productId}`, { method: 'DELETE' }),
};
