'use client';

import { useCartStore } from '@platform/shared-state';
import type { Product } from '@platform/types';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Badge,
  Pagination,
  Tabs,
  TabList,
  Tab,
  Dropdown,
} from '@platform/ui';
import { useToast } from '@platform/ui';
import { formatCurrency } from '@platform/utils';
import { useState, useCallback, useMemo } from 'react';

/** Mock data — in production, replaced by useProducts() hook backed by TanStack Query */
const MOCK_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
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
  description:
    'Premium quality product designed for professionals. Built with sustainable materials.',
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
  inventory: { quantity: 50, status: 'in_stock' },
  rating: { average: 3.5 + Math.random() * 1.5, count: Math.floor(Math.random() * 500) },
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const CATEGORIES = ['All', 'Audio', 'Accessories', 'Peripherals'];

export default function ProductsMfe() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.cart?.items ?? []);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      if (selectedCategory !== 'All' && p.category.name !== selectedCategory) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating.average - a.rating.average;
      return 0;
    });
  }, [search, selectedCategory, sortBy]);

  const pageSize = 6;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem({
        id: product.id,
        product,
        quantity: 1,
        addedAt: new Date().toISOString(),
      });
      showToast({ type: 'success', message: `${product.name} added to cart` });
    },
    [addItem, showToast],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 dark:text-gray-400">{filtered.length} products found</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64"
          />
          <Dropdown
            trigger={<Button variant="outline">Sort</Button>}
            items={[
              { label: 'Newest', onClick: () => setSortBy('newest') },
              { label: 'Price: Low to High', onClick: () => setSortBy('price_asc') },
              { label: 'Price: High to Low', onClick: () => setSortBy('price_desc') },
              { label: 'Top Rated', onClick: () => setSortBy('rating') },
            ]}
          />
        </div>
      </div>

      <Tabs
        defaultIndex={0}
        onChange={(i) => {
          setSelectedCategory(CATEGORIES[i]);
          setCurrentPage(1);
        }}
      >
        <TabList>
          {CATEGORIES.map((cat) => (
            <Tab key={cat}>{cat}</Tab>
          ))}
        </TabList>
      </Tabs>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((product) => (
          <Card key={product.id} className="group transition-shadow hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.category.name}
                  </p>
                </div>
                <Badge variant="default">{product.rating.average.toFixed(1)} ★</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {product.description}
              </p>
            </CardBody>
            <CardFooter className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {(() => {
                const cartItem = cartItems.find((i) => i.id === product.id);
                if (cartItem) {
                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          if (cartItem.quantity <= 1) removeItem(product.id);
                          else updateItemQuantity(product.id, cartItem.quantity - 1);
                        }}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {cartItem.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateItemQuantity(product.id, cartItem.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  );
                }
                return (
                  <Button size="sm" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </Button>
                );
              })()}
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
