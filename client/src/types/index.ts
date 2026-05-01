export type UserRole = 'customer' | 'admin';

export type ProductCategory =
  | 'Hambúrgueres'
  | 'Pizzas'
  | 'Bebidas'
  | 'Sobremesas'
  | 'Combos'
  | 'Porções';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Hambúrgueres',
  'Pizzas',
  'Bebidas',
  'Sobremesas',
  'Combos',
  'Porções',
];

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'pix' | 'credit_card' | 'debit_card';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pedido recebido',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  preparationTime: number;
  createdAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string | { id: string; name: string; email: string };
  items: OrderItem[];
  total: number;
  discount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  address: Address;
  notes?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: { id: string; name: string } | string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  totalSold: number;
  totalProducts: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
