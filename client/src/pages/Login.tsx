import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ApiError } from '../services/api';
import { toast } from '../hooks/useToast';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success('Bem-vindo de volta!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao entrar');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthShell title="Entrar" subtitle="Bem-vindo de volta ao QuickOrder Burger.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
        <strong>Conta de teste:</strong>
        <div>Cliente: <code>cliente@quickorder.com</code> / <code>123456</code></div>
        <div>Admin: <code>admin@quickorder.com</code> / <code>123456</code></div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Não tem conta?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Cadastre-se
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl dark:bg-brand-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-500/15"
      />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/30">
              <ChefHat className="h-6 w-6" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-base font-bold tracking-tight">QuickOrder</div>
              <div className="-mt-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
                Burger
              </div>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            <span className="gradient-text">{title}</span>
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800/70 dark:bg-slate-900 dark:shadow-black/30">
          {children}
        </div>
      </div>
    </div>
  );
}
