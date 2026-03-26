'use client';

import {
  Card, CardBody, Button, Input, Avatar, Badge,
  Tabs, TabList, Tab, TabPanel, Switch, Accordion, AccordionItem,
} from '@platform/ui';
import { useTheme } from '@platform/ui';
import { EventBus } from '@platform/event-bus';
import { formatCurrency, formatDate } from '@platform/utils';

const MOCK_ORDERS = [
  { id: 'ord_1', date: '2025-03-20', total: 259.97, status: 'delivered' as const, items: 3 },
  { id: 'ord_2', date: '2025-03-15', total: 149.99, status: 'shipped' as const, items: 1 },
  { id: 'ord_3', date: '2025-02-28', total: 89.98, status: 'delivered' as const, items: 2 },
];

export default function UserMfe() {
  // The middleware already guards /dashboard — if we're here, the user is authenticated.
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center p-8 sm:flex-row sm:items-start sm:gap-6">
        <Avatar name="Alex Johnson" size="lg" />
        <div className="mt-4 text-center sm:mt-0 sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alex Johnson</h1>
          <p className="text-gray-500">demo@platform.io</p>
          <div className="mt-2 flex gap-2 justify-center sm:justify-start">
            <Badge variant="info">customer</Badge>
            <Badge variant="success">Active</Badge>
          </div>
        </div>
        <div className="sm:ml-auto mt-4 sm:mt-0">
          <Button variant="outline" onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            EventBus.publish('auth:logout', undefined);
            window.location.href = '/login';
          }}>Sign Out</Button>
        </div>
      </Card>

      <Tabs defaultIndex={0}>
        <TabList><Tab>Overview</Tab><Tab>Orders</Tab><Tab>Settings</Tab></TabList>
        <TabPanel>
          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            <Card><CardBody className="text-center"><p className="text-3xl font-bold text-brand-600">{MOCK_ORDERS.length}</p><p className="text-sm text-gray-500">Total Orders</p></CardBody></Card>
            <Card><CardBody className="text-center"><p className="text-3xl font-bold text-brand-600">{formatCurrency(MOCK_ORDERS.reduce((s, o) => s + o.total, 0))}</p><p className="text-sm text-gray-500">Total Spent</p></CardBody></Card>
            <Card><CardBody className="text-center"><p className="text-3xl font-bold text-brand-600">4.8</p><p className="text-sm text-gray-500">Avg Rating</p></CardBody></Card>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-4 space-y-3">
            {MOCK_ORDERS.map((order) => (
              <Card key={order.id} className="flex items-center justify-between p-4">
                <div><p className="font-medium">{order.id}</p><p className="text-sm text-gray-500">{formatDate(order.date)} · {order.items} items</p></div>
                <div className="text-right"><p className="font-semibold">{formatCurrency(order.total)}</p><Badge variant={order.status === 'delivered' ? 'success' : 'info'}>{order.status}</Badge></div>
              </Card>
            ))}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-4">
            <Accordion>
              <AccordionItem title="Appearance">
                <div className="flex items-center justify-between py-2">
                  <div><p className="font-medium">Dark Mode</p><p className="text-sm text-gray-500">Toggle dark mode theme</p></div>
                  <Switch checked={resolvedTheme === 'dark'} onChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                </div>
              </AccordionItem>
              <AccordionItem title="Notifications">
                <div className="flex items-center justify-between py-2">
                  <div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive order updates via email</p></div>
                  <Switch checked={true} onChange={() => {}} />
                </div>
              </AccordionItem>
              <AccordionItem title="Account">
                <div className="space-y-4 py-2">
                  <Input label="Display Name" defaultValue="Alex Johnson" />
                  <Input label="Email" type="email" defaultValue="demo@platform.io" />
                  <Button>Update Profile</Button>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
