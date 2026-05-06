import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { productsApi } from '../../services/products';
import { PRODUCT_CATEGORIES, type Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatPrice } from '../../utils/cn';
import { toast } from '../../hooks/useToast';
import { ApiError } from '../../services/api';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().nonnegative(),
  category: z.enum(PRODUCT_CATEGORIES as [string, ...string[]]),
  imageUrl: z.string().url('URL inválida'),
  preparationTime: z.coerce.number().int().min(1).max(180),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => {
    setLoading(true);
    productsApi
      .list()
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Excluir "${product.name}"?`)) return;
    try {
      await productsApi.remove(product.id);
      toast.success('Produto excluído');
      reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao excluir');
    }
  };

  const toggleAvailable = async (product: Product) => {
    try {
      await productsApi.update(product.id, { available: !product.available });
      reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar');
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Produtos <span className="text-slate-500 dark:text-slate-400">({products.length})</span>
        </h2>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="Sem produtos" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        {p.featured ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400">★ Destaque</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailable(p)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.available
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {p.available ? 'Disponível' : 'Indisponível'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        aria-label="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={reload}
      />
      <ProductFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        initial={editing}
        onSaved={reload}
      />
    </div>
  );
}

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Product | null;
  onSaved: () => void;
}

function ProductFormModal({ open, onClose, initial, onSaved }: FormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: initial
      ? {
          name: initial.name,
          description: initial.description,
          price: initial.price,
          category: initial.category,
          imageUrl: initial.imageUrl,
          preparationTime: initial.preparationTime,
          available: initial.available,
          featured: initial.featured,
        }
      : {
          name: '',
          description: '',
          price: 0,
          category: 'Hambúrgueres',
          imageUrl: '',
          preparationTime: 20,
          available: true,
          featured: false,
        },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      if (initial) {
        await productsApi.update(initial.id, values as never);
        toast.success('Produto atualizado');
      } else {
        await productsApi.create(values as never);
        toast.success('Produto criado');
        reset();
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Editar produto' : 'Novo produto'}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Nome" {...register('name')} error={errors.name?.message} />
        <Textarea
          label="Descrição"
          rows={3}
          {...register('description')}
          error={errors.description?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            {...register('price')}
            error={errors.price?.message}
          />
          <Input
            label="Tempo (min)"
            type="number"
            {...register('preparationTime')}
            error={errors.preparationTime?.message}
          />
        </div>
        <Select label="Categoria" {...register('category')} error={errors.category?.message}>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input label="URL da imagem" {...register('imageUrl')} error={errors.imageUrl?.message} />
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('available')} className="h-4 w-4" />
            Disponível
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('featured')} className="h-4 w-4" />
            Destaque
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {initial ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
