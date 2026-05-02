import { apiFetch } from './api';
import type { Review } from '../types';

export const reviewsApi = {
  byProduct: (productId: string) =>
    apiFetch<{ reviews: Review[]; averageRating: number; total: number }>(
      `/reviews/product/${productId}`
    ),
  create: (data: { productId: string; rating: number; comment: string }) =>
    apiFetch<{ review: Review }>('/reviews', { method: 'POST', body: data }),
};
