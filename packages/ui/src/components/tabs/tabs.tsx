'use client';

import {
  createContext, useContext, useState, useId,
  Children, cloneElement, isValidElement,
  type ReactNode, type ReactElement,
} from 'react';

import { cn } from '@platform/utils';

interface TabsContext {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  baseId: string;
}

const TabsCtx = createContext<TabsContext>({ activeIndex: 0, setActiveIndex: () => {}, baseId: '' });

export interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export function Tabs({ children, defaultIndex = 0, onChange, className }: TabsProps) {
  const [activeIndex, setActive] = useState(defaultIndex);
  const baseId = useId();
  const setActiveIndex = (i: number) => { setActive(i); onChange?.(i); };

  // Inject _index into TabPanel children
  let panelIndex = 0;
  const mapped = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === TabPanel) {
      return cloneElement(child as ReactElement<{ _index: number }>, { _index: panelIndex++ });
    }
    return child;
  });

  return (
    <TabsCtx.Provider value={{ activeIndex, setActiveIndex, baseId }}>
      <div className={className}>{mapped}</div>
    </TabsCtx.Provider>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(TabsCtx);
  let tabIdx = 0;

  const tabs = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<{ _index: number }>, { _index: tabIdx++ });
  });

  return (
    <div role="tablist" className={cn('flex gap-1 border-b border-gray-200 dark:border-gray-700', className)}>
      {tabs}
    </div>
  );
}

export function Tab({ children, className, _index = 0 }: { children: ReactNode; className?: string; _index?: number }) {
  const { activeIndex, setActiveIndex, baseId } = useContext(TabsCtx);
  const isActive = activeIndex === _index;

  return (
    <button
      role="tab"
      id={`${baseId}-tab-${_index}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${_index}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveIndex(_index)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') setActiveIndex(_index + 1);
        if (e.key === 'ArrowLeft' && _index > 0) setActiveIndex(_index - 1);
      }}
      className={cn(
        'px-4 py-2.5 text-sm font-medium transition-colors -mb-px',
        isActive
          ? 'border-b-2 border-brand-600 text-brand-600'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ children, className, _index = 0 }: { children: ReactNode; className?: string; _index?: number }) {
  const { activeIndex, baseId } = useContext(TabsCtx);
  if (activeIndex !== _index) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${_index}`}
      aria-labelledby={`${baseId}-tab-${_index}`}
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  );
}
