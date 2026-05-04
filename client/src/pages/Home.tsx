import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, ChefHat, Sparkles, Truck } from 'lucide-react';
import { productsApi } from '../services/products';
import type { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryFilter } from '../components/product/CategoryFilter';
import { SearchBar } from '../components/product/SearchBar';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useFavorites } from '../hooks/useFavorites';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ available: true })
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, category, search]);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 to-amber-500 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" />
              QuickOrder Burger · São Paulo
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Hambúrgueres artesanais,
              <br />
              entrega em <span className="text-amber-200">30 minutos</span>.
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">
              Cardápio fresco, ingredientes selecionados e entrega rápida na sua porta.
              Peça em poucos cliques.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Stat icon={ChefHat} label="Cozinha aberta" value="Todo dia" />
              <Stat icon={Truck} label="Entrega" value="20–35 min" />
              <Stat icon={SearchIcon} label="Cardápio" value={`${products.length}+ itens`} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {/* Featured */}
        {!loading && featured.length > 0 ? (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Destaques</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Os mais pedidos da semana.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={isFavorite(p.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Search + filter */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Cardápio completo</h2>
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter value={category} onChange={setCategory} />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title="Nenhum produto encontrado"
              description="Tente outro termo ou categoria."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={isFavorite(p.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ChefHat;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs">
        <span className="font-semibold">{value}</span>{' '}
        <span className="text-white/80">{label}</span>
      </span>
    </div>
  );
}
