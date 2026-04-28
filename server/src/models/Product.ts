import { Schema, model, Document, Types } from 'mongoose';

export const PRODUCT_CATEGORIES = [
  'Hambúrgueres',
  'Pizzas',
  'Bebidas',
  'Sobremesas',
  'Combos',
  'Porções',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
      index: true,
    },
    imageUrl: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    preparationTime: { type: Number, default: 20, min: 1 },
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r.id = r._id;
    delete r._id;
    delete r.__v;
    return r;
  },
});

export const Product = model<IProduct>('Product', productSchema);
