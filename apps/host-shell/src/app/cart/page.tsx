import { Spinner } from '@platform/ui';
import dynamic from 'next/dynamic';

const CartMfe = dynamic(() => import('@/components/mfe/cart-mfe'), {
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export const metadata = { title: 'Shopping Cart' };

export default function Cart() {
  return <CartMfe />;
}
