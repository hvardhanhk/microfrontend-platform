'use client';

import Link from 'next/link';

import { Card, CardBody, CardHeader, CardFooter, Button, Badge } from '@platform/ui';
import { useCartStore } from '@platform/shared-state';
import { formatCurrency } from '@platform/utils';

/**
 * Cart MFE — reads from the shared Zustand cart store.
 * Products added from the Products MFE appear here in real time.
 */
export default function CartMfe() {
  const cart = useCartStore((s) => s.cart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.tax ?? 0;
  const shipping = cart?.shipping ?? 0;
  const total = cart?.total ?? 0;
  const itemCount = cart?.itemCount ?? 0;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <Card>
          <CardBody className="flex flex-col items-center py-16">
            <svg className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Your cart is empty</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add some products to get started</p>
            <Link href="/products" className="mt-6">
              <Button>Browse Products</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shopping Cart <Badge variant="info" className="ml-2">{itemCount} {itemCount === 1 ? 'item' : 'items'}</Badge>
        </h1>
        <Button variant="ghost" onClick={clearCart}>Clear Cart</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-row items-center gap-4 p-4">
              <img
                src={item.product.images[0]?.url}
                alt={item.product.name}
                className="h-20 w-20 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.category.name}</p>
                <p className="font-semibold text-brand-600">{formatCurrency(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader><h2 className="text-lg font-semibold">Order Summary</h2></CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </CardBody>
          <CardFooter><Button className="w-full" size="lg">Proceed to Checkout</Button></CardFooter>
        </Card>
      </div>
    </div>
  );
}
