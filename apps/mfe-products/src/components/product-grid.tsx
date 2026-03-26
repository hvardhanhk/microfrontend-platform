'use client';

import { EventBus } from '@platform/event-bus';
import type { Product } from '@platform/types';
import { Card, CardBody, CardFooter, Button, Input, Badge, Pagination } from '@platform/ui';
import { formatCurrency } from '@platform/utils';
import { useState, useMemo } from 'react';

const PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prod_${i + 1}`,
  name: [
    'Wireless Headphones',
    'Laptop Stand',
    'Mechanical Keyboard',
    'USB-C Hub',
    'Monitor Light Bar',
    'Ergonomic Mouse',
    'Desk Mat',
    'Webcam HD',
    'Noise Cancelling Earbuds',
    'Portable Charger',
    'Smart Speaker',
    'Cable Organizer',
  ][i],
  slug: `product-${i + 1}`,
  description: 'Premium quality product designed for professionals.',
  price: [79.99, 49.99, 149.99, 39.99, 59.99, 69.99, 29.99, 89.99, 129.99, 44.99, 99.99, 19.99][i],
  currency: 'USD',
  images: [
    {
      id: `img_${i}`,
      url: `https://picsum.photos/seed/${i + 10}/400/400`,
      alt: `Product ${i + 1}`,
      width: 400,
      height: 400,
      isPrimary: true,
    },
  ],
  category: {
    id: `cat_${(i % 3) + 1}`,
    name: ['Audio', 'Accessories', 'Peripherals'][i % 3],
    slug: ['audio', 'accessories', 'peripherals'][i % 3],
  },
  tags: ['featured'],
  variants: [],
  inventory: { quantity: 50, status: 'in_stock' as const },
  rating: { average: 4 + Math.random(), count: 100 + Math.floor(Math.random() * 400) },
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export function ProductGrid() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => PRODUCTS.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const pageSize = 6;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleAddToCart = (product: Product) => {
    EventBus.publish('product:add-to-cart', { productId: product.id, quantity: 1 });
    EventBus.publish('notification:show', {
      type: 'success',
      message: `${product.name} added to cart`,
    });
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>
            <CardBody>
              <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category.name}</p>
              <Badge variant="default" className="mt-1">
                {product.rating.average.toFixed(1)} ★
              </Badge>
            </CardBody>
            <CardFooter className="flex items-center justify-between">
              <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
              <Button size="sm" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
