import { Link } from 'react-router-dom';
import { Heart, Plus, Clock } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../store/cartStore';
import { cn, formatPrice } from '../../utils/cn';
import { toast } from '../../hooks/useToast';

interface Props {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export function ProductCard({ product, isFavorite, onToggleFavorite }: Props) {
  const add = useCart((s) => s.add);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900',
        product.available
          ? 'border-slate-200/80 dark:border-slate-800'
          : 'border-slate-200/80 opacity-60 dark:border-slate-800'
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            Destaque
          </span>
        ) : null}
        {!product.available ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
              Indisponível
            </span>
          </div>
        ) : null}
        {onToggleFavorite ? (
          <button
            onClick={handleFav}
            aria-label={isFavorite ? 'Desfavoritar' : 'Favoritar'}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition-colors hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900"
          >
            <Heart
              className={cn(
                'h-4 w-4',
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-slate-600 dark:text-slate-300'
              )}
            />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
            {product.name}
          </h3>
          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {product.category}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
          {product.description}
        </p>
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3 w-3" />
          {product.preparationTime} min
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-bold tracking-tight">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.available}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-amber-500 px-3 text-sm font-medium text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-lg hover:shadow-brand-500/40 active:scale-[0.97] disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
    </Link>
  );
}
