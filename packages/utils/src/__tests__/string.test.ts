import { generateId, slugify, truncate } from '../string';

describe('generateId', () => {
  it('generates unique ids', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  it('supports prefix', () => {
    const id = generateId('item');
    expect(id).toMatch(/^item_/);
  });
});

describe('slugify', () => {
  it('converts to lowercase kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips special characters', () => {
    expect(slugify('Product #1 (New!)')).toBe('product-1-new');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });
});

describe('truncate', () => {
  it('returns original string if short enough', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with suffix', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('supports custom suffix', () => {
    expect(truncate('hello world', 8, '...')).toBe('hello...');
  });
});
