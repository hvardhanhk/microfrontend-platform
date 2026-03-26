import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from '../button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables when isLoading', () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('disables when disabled prop is set', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-red-600');
  });

  it('applies size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild).toHaveClass('h-12');
  });
});
