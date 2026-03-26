'use client';

import { cn } from '@platform/utils';

export interface SidebarItem {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ items, isOpen, onClose, className }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white pt-16',
          'dark:border-gray-800 dark:bg-gray-950',
          'transition-transform duration-200',
          'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    item.isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                  )}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
