export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  category: ProductCategory;
  tags: string[];
  variants: ProductVariant[];
  inventory: InventoryStatus;
  rating: ProductRating;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  attributes: Record<string, string>;
  inventory: number;
}

export interface InventoryStatus {
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  inStock?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
