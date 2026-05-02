import { useCallback, useEffect, useState } from 'react';
import { favoritesApi } from '../services/favorites';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types';
import { toast } from './useToast';
import { ApiError } from '../services/api';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    favoritesApi
      .list()
      .then((data) => setFavorites(data.favorites.map((f) => f.productId)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  const isFavorite = useCallback(
    (productId: string) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const toggle = useCallback(
    async (product: Product) => {
      if (!user) {
        toast.info('Faça login para favoritar produtos');
        return;
      }
      try {
        if (isFavorite(product.id)) {
          await favoritesApi.remove(product.id);
          setFavorites((prev) => prev.filter((p) => p.id !== product.id));
          toast.info(`${product.name} removido dos favoritos`);
        } else {
          await favoritesApi.add(product.id);
          setFavorites((prev) => [...prev, product]);
          toast.success(`${product.name} adicionado aos favoritos`);
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar favoritos');
      }
    },
    [user, isFavorite]
  );

  return { favorites, loading, isFavorite, toggle };
}
