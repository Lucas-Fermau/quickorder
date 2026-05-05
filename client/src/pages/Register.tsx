import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ApiError } from '../services/api';
import { toast } from '../hooks/useToast';
import { AuthShell } from './Login';

const schema = z
  .object({
    name: z.string().min(2, 'Mínimo de 2 caracteres').max(80),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      toast.success('Conta criada!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao cadastrar');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthShell title="Criar conta" subtitle="Cadastre-se em segundos e peça em poucos cliques.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome"
          {...register('name')}
          error={errors.name?.message}
        />
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
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Criar conta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
