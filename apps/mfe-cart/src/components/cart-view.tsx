'use client';

import { useEventBus } from '@platform/event-bus';
import { Card, CardBody, CardHeader, CardFooter, Button } from '@platform/ui';
import { formatCurrency } from '@platform/utils';

export function CartView() {
  useEventBus(
    'product:add-to-cart',
    (payload) => {
      console.log('[Cart MFE] Product added:', payload.productId);
    },
    { replayLast: true },
  );

  const items = [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: 79.99,
      qty: 2,
      img: 'https://picsum.photos/seed/10/100',
    },
    {
      id: '2',
      name: 'Laptop Stand',
      price: 49.99,
      qty: 1,
      img: 'https://picsum.photos/seed/11/100',
    },
  ];
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center gap-4 p-4">
            <img src={item.img} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-500">
                {formatCurrency(item.price)} x {item.qty}
              </p>
            </div>
            <p className="font-semibold">{formatCurrency(item.price * item.qty)}</p>
          </Card>
        ))}
      </div>
      <Card className="h-fit">
        <CardHeader>
          <h2 className="text-lg font-semibold">Summary</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardBody>
        <CardFooter>
          <Button className="w-full" size="lg">
            Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
