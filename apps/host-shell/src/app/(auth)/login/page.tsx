'use client';

import { useState } from 'react';

import { Card, CardBody, CardHeader, Button, Input } from '@platform/ui';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Login failed');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-20">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-center text-gray-500">Sign in to your account</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
            <Input label="Password" name="password" type="password" placeholder="********" required />
            <Button className="w-full" type="submit" isLoading={isLoading}>Sign In</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
