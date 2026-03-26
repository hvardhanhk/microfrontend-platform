'use client';

import { Card, CardBody, CardHeader, Button, Input } from '@platform/ui';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-20">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Create Account</h1>
        </CardHeader>
        <CardBody>
          <form className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" required />
            <Input label="Email" type="email" placeholder="you@example.com" required />
            <Input label="Password" type="password" placeholder="********" required />
            <Input label="Confirm Password" type="password" placeholder="********" required />
            <Button className="w-full" type="submit">
              Create Account
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
