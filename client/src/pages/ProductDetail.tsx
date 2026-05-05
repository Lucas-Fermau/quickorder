import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, Plus, Star, MessageCircle } from 'lucide-react';
import { productsApi } from '../services/products';
import { reviewsApi } from '../services/reviews';
import type { Product, Review } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Input';
import { useCart } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { QuantitySelector } from '../components/cart/QuantitySelector';
import { cn, formatPrice, formatDate } from '../utils/cn';
import { toast } from '../hooks/useToast';
import { ApiError } from '../services/api';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const add = useCart((s) => s.add);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([productsApi.getById(id), reviewsApi.byProduct(id)])
      .then(([p, r]) => {
        setProduct(p.product);
        setReviews(r.reviews);
        setAverageRating(r.averageRating);
      })
      .catch(() => toast.error('Produto não encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const handleAdd = () => {
    add(product, quantity);
    toast.success(`${product.name} (x${quantity}) adicionado ao carrinho`);
  };

  const reload = () => {
    if (!id) return;
    reviewsApi.byProduct(id).then((r) => {
      setReviews(r.reviews);
      setAverageRating(r.averageRating);
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {product.category}
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {product.preparationTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {averageRating.toFixed(1)} ({reviews.length})
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(product)}
              aria-label="Favoritar"
              className="rounded-full bg-white p-2.5 shadow-md ring-1 ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700"
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isFavorite(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              />
            </button>
          </div>

          <p className="text-base text-slate-700 dark:text-slate-300">{product.description}</p>

          <div className="flex items-baseline gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="text-3xl font-bold tracking-tight gradient-text">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.available ? (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <Button onClick={handleAdd} size="lg" className="flex-1">
                <Plus className="h-4 w-4" />
                Adicionar — {formatPrice(product.price * quantity)}
              </Button>
            </div>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
              Produto indisponível no momento.
            </p>
          )}
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            Avaliações <span className="text-slate-500 dark:text-slate-400">({reviews.length})</span>
          </h2>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(true)}>
              <MessageCircle className="h-4 w-4" />
              Avaliar
            </Button>
          ) : null}
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Seja o primeiro a avaliar este produto.
          </p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => {
              const author = typeof r.userId === 'string' ? 'Anônimo' : r.userId.name;
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{author}</span>
                      <Stars value={r.rating} />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{r.comment}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={product.id}
        onSaved={reload}
      />
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= value ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'
          )}
        />
      ))}
    </div>
  );
}

function ReviewModal({
  open,
  onClose,
  productId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (comment.trim().length < 2) {
      toast.error('Escreva um comentário');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create({ productId, rating, comment });
      toast.success('Avaliação enviada');
      setComment('');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Avaliar produto">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sua nota
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} estrelas`}
                className="rounded p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-7 w-7',
                    n <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <Textarea
          label="Comentário"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Conte como foi sua experiência..."
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={submitting}>
            Enviar avaliação
          </Button>
        </div>
      </div>
    </Modal>
  );
}
