import { Schema, model, Document, Types } from 'mongoose';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ['cash', 'pix', 'credit_card', 'debit_card'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface IAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  discount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  address: IAddress;
  notes?: string;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, required: true },
  },
  { _id: false }
);

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    complement: { type: String, trim: true },
    neighborhood: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalTotal: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    address: { type: addressSchema, required: true },
    notes: { type: String, maxlength: 500, trim: true },
    couponCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r.id = r._id;
    delete r._id;
    delete r.__v;
    return r;
  },
});

export const Order = model<IOrder>('Order', orderSchema);
