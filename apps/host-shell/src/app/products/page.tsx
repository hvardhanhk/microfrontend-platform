import dynamic from 'next/dynamic';
import { Spinner } from '@platform/ui';

const ProductsMfe = dynamic(() => import('@/components/mfe/products-mfe'), {
  loading: () => <div className="flex h-96 items-center justify-center"><Spinner size="lg" /></div>,
});

export const metadata = { title: 'Products', description: 'Browse our product catalog' };

export default function Products() {
  return <ProductsMfe />;
}
