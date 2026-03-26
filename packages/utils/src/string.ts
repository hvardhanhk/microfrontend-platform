export function generateId(prefix = ''): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}
