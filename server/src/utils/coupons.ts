export interface CouponResult {
  code: string;
  discount: number;
  description: string;
}

export function applyCoupon(code: string, subtotal: number): CouponResult | null {
  const upper = code.trim().toUpperCase();

  switch (upper) {
    case 'QUICK10':
      return {
        code: upper,
        discount: Math.round(subtotal * 0.1 * 100) / 100,
        description: '10% de desconto',
      };
    case 'PRIMEIRA':
      return {
        code: upper,
        discount: Math.round(subtotal * 0.15 * 100) / 100,
        description: '15% de desconto',
      };
    case 'FRETE20':
      return {
        code: upper,
        discount: Math.min(20, subtotal),
        description: 'R$ 20 de desconto',
      };
    default:
      return null;
  }
}
