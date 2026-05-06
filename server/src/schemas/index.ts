import { z } from 'zod';

export const PRODUCT_CATEGORIES = [
  'Hambúrgueres',
  'Pizzas',
  'Bebidas',
  'Sobremesas',
  'Combos',
  'Porções',
] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;

export const PAYMENT_METHODS = [
  'cash',
  'pix',
  'credit_card',
  'debit_card',
] as const;

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(80),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(72),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(600),
  price: z.number().nonnegative('Preço inválido'),
  category: z.enum(PRODUCT_CATEGORIES),
  imageUrl: z.string().url('URL da imagem inválida'),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  preparationTime: z.number().int().min(1).max(180).default(20),
});

export const productUpdateSchema = productSchema.partial();

export const productListQuerySchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  search: z.string().trim().optional(),
  featured: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  available: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  zipCode: z.string().min(1, 'CEP é obrigatório'),
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Carrinho vazio'),
  paymentMethod: z.enum(PAYMENT_METHODS),
  address: addressSchema,
  notes: z.string().max(500).optional(),
  couponCode: z.string().trim().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const orderListQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(2).max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
