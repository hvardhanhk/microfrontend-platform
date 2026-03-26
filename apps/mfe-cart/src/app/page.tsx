import { CartView } from '@/components/cart-view';

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
      <p className="text-gray-500">Standalone MFE — independently deployable on port 3002</p>
      <CartView />
    </div>
  );
}
