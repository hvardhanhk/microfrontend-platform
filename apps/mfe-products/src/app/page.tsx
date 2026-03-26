import { ProductGrid } from '@/components/product-grid';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
      <p className="text-gray-500">Standalone MFE — independently deployable on port 3001</p>
      <ProductGrid />
    </div>
  );
}
