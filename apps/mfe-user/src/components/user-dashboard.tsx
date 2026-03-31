'use client';

import { EventBus } from '@platform/event-bus';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Switch,
  Accordion,
  AccordionItem,
} from '@platform/ui';
import { formatCurrency, formatDate } from '@platform/utils';
import { useState } from 'react';

const ORDERS = [
  { id: 'ord_1', date: '2025-03-20', total: 259.97, status: 'delivered' as const },
  { id: 'ord_2', date: '2025-03-15', total: 149.99, status: 'shipped' as const },
];

export function UserDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoggedIn(true);
    setLoading(false);
    EventBus.publish('auth:login', {
      user: {
        id: 'user_1',
        email: 'demo@platform.io',
        name: 'Alex Johnson ',
        role: 'customer',
        preferences: { theme: 'system', language: 'en', currency: 'USD', notifications: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  };

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md py-20">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-center">Sign In</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Password" type="password" />
            <Button className="w-full" onClick={handleLogin} isLoading={loading}>
              Sign In (Demo)
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
        <Avatar name="Alex Johnson" size="lg" />
        <div>
          <h1 className="text-2xl font-bold">Alex Johnson</h1>
          <p className="text-gray-500">demo@platform.io</p>
          <Badge variant="info" className="mt-1">
            customer
          </Badge>
        </div>
        <Button
          variant="outline"
          className="sm:ml-auto"
          onClick={() => {
            setLoggedIn(false);
            EventBus.publish('auth:logout', undefined);
          }}
        >
          Sign Out
        </Button>
      </Card>

      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Orders</Tab>
          <Tab>Settings</Tab>
        </TabList>
        <TabPanel>
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <Card>
              <CardBody className="text-center">
                <p className="text-3xl font-bold text-brand-600">{ORDERS.length}</p>
                <p className="text-sm text-gray-500">Orders</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <p className="text-3xl font-bold text-brand-600">
                  {formatCurrency(ORDERS.reduce((s, o) => s + o.total, 0))}
                </p>
                <p className="text-sm text-gray-500">Spent</p>
              </CardBody>
            </Card>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-4 space-y-3">
            {ORDERS.map((o) => (
              <Card key={o.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{o.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(o.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(o.total)}</p>
                  <Badge variant={o.status === 'delivered' ? 'success' : 'info'}>{o.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-4">
            <Accordion>
              <AccordionItem title="Appearance">
                <div className="flex items-center justify-between py-2">
                  <p className="font-medium">Dark Mode</p>
                  <Switch checked={false} onChange={() => {}} />
                </div>
              </AccordionItem>
              <AccordionItem title="Profile">
                <div className="space-y-3 py-2">
                  <Input label="Name" defaultValue="Alex Johnson" />
                  <Input label="Email" defaultValue="demo@platform.io" />
                  <Button>Save</Button>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
