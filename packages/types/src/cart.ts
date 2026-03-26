import type { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  itemCount: number;
  updatedAt: string;
}

export interface AddToCartPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isUpdating: boolean;
}
