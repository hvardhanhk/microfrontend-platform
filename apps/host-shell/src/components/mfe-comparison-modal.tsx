'use client';

import { Modal, Button } from '@platform/ui';
import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Architecture diagrams
───────────────────────────────────────────────────────────────────────────── */

const MULTIZONE_DIAGRAM = `
  ┌─────────────────────────────────────────────────────────────────┐
  │                NEXT.JS MULTI-ZONE ARCHITECTURE                  │
  └─────────────────────────────────────────────────────────────────┘

  BROWSER
    │  visits https://yourapp.com/products/42
    ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  host-shell  (yourapp.vercel.app)                            │
  │  owns: /  /login  /register  /api/auth/*                     │
  │                                                              │
  │  next.config.ts rewrites():                                  │
  │    /products/* ──────────────────────────────────────────►  │
  │    /cart/*     ──────────────────────────────────────────►  │
  │    /dashboard/*──────────────────────────────────────────►  │
  └──────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
  ┌───────────────┐  ┌────────────────┐  ┌─────────────────┐
  │  mfe-products │  │   mfe-cart     │  │   mfe-user      │
  │  (own deploy) │  │  (own deploy)  │  │  (own deploy)   │
  │               │  │                │  │                 │
  │ basePath:     │  │ basePath:      │  │ basePath:       │
  │  /products    │  │  /cart         │  │  /dashboard     │
  │               │  │                │  │                 │
  │ assetPrefix:  │  │ assetPrefix:   │  │ assetPrefix:    │
  │  own origin   │  │  own origin    │  │  own origin     │
  └───────────────┘  └────────────────┘  └─────────────────┘

  SHARED CHROME — @platform/shell (workspace package)
  ┌──────────────────────────────────────────────────────────────┐
  │  AppShell  ──  same navbar/sidebar rendered by all 4 zones   │
  │  CrossZoneBridge  ──  localStorage storage event sync        │
  └──────────────────────────────────────────────────────────────┘

  CROSS-ZONE STATE
  ┌──────────────────────────────────────────────────────────────┐
  │  Zustand persist ──► localStorage["platform-cart"]           │
  │  Tab A mutates ──► storage event ──► Tab B CrossZoneBridge   │
  │  Auth: HTTP-only cookie (origin-scoped, shared across zones) │
  └──────────────────────────────────────────────────────────────┘

  NAVIGATION
    /products → /cart  =  full-page reload  (intentional)
    Within /products   =  SPA client-side   (normal Next.js)`;

const MODULE_FEDERATION_DIAGRAM = `
  ┌─────────────────────────────────────────────────────────────────┐
  │            WEBPACK MODULE FEDERATION ARCHITECTURE               │
  └─────────────────────────────────────────────────────────────────┘

  BUILD TIME — each app compiled independently
  ┌──────────────────────────────────────────────────────────────┐
  │  mfe-products (Remote)          mfe-cart (Remote)            │
  │  NextFederationPlugin           NextFederationPlugin         │
  │  exposes: {                     exposes: {                   │
  │    "./ProductGrid":               "./CartView":              │
  │      "./src/components/          "./src/components/         │
  │         product-grid"               cart-view"              │
  │  }                              }                           │
  │  ──► remoteEntry.js             ──► remoteEntry.js           │
  └──────────────────────────────────────────────────────────────┘

  RUNTIME — host downloads remoteEntry.js on demand
  ┌──────────────────────────────────────────────────────────────┐
  │  host-shell (Host + Consumer)                                │
  │  NextFederationPlugin                                        │
  │  remotes: {                                                  │
  │    mfe_products:                                             │
  │      "mfe_products@https://mfe-products.vercel.app/         │
  │       _next/static/chunks/remoteEntry.js",                  │
  │    mfe_cart:                                                 │
  │      "mfe_cart@https://mfe-cart.vercel.app/..."             │
  │  }                                                           │
  └──────────────────────────────────────────────────────────────┘
          │  user navigates to /products
          ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  1. host renders ProductsPage                                │
  │  2. dynamic import("mfe_products/ProductGrid") triggers      │
  │  3. browser fetches remoteEntry.js from mfe-products CDN     │
  │  4. remoteEntry registers mfe_products container             │
  │  5. host loads ProductGrid chunk — renders IN SAME PAGE      │
  └──────────────────────────────────────────────────────────────┘

  SHARED JS CONTEXT (single React tree in the browser)
  ┌──────────────────────────────────────────────────────────────┐
  │  shared singletons:                                          │
  │    react            ──  one instance for all MFEs            │
  │    @platform/ui     ──  one copy of components               │
  │    @platform/shell  ──  one AppShell in the tree             │
  │    @platform/shared-state ── one Zustand store               │
  │    @platform/event-bus    ── in-memory, works across MFEs    │
  └──────────────────────────────────────────────────────────────┘

  NAVIGATION
    /products → /cart  =  SPA client-side  (no reload)
    Remote component   =  lazy-loaded into same page`;

/* ─────────────────────────────────────────────────────────────────────────────
   Decision criteria
───────────────────────────────────────────────────────────────────────────── */

type Verdict = 'yes' | 'no' | 'partial';
interface Criterion {
  category: string;
  multizone: { verdict: Verdict; text: string };
  moduleFed: { verdict: Verdict; text: string };
}

const CRITERIA: Criterion[] = [
  {
    category: 'App Router & RSC',
    multizone: {
      verdict: 'yes',
      text: 'Full support — each zone is a standard Next.js app with no constraints on App Router, RSC, or streaming.',
    },
    moduleFed: {
      verdict: 'partial',
      text: 'Immature as of 2025. @module-federation/enhanced partially works but RSC and Suspense boundaries across remotes are unstable.',
    },
  },
  {
    category: 'Navigation between MFEs',
    multizone: {
      verdict: 'no',
      text: 'Full-page reload on every cross-zone transition. Intentional — each zone has a separate JS bundle and React tree.',
    },
    moduleFed: {
      verdict: 'yes',
      text: 'True SPA — components from different remotes render in the same page. No reload when switching between product list and cart.',
    },
  },
  {
    category: 'Component-level sharing',
    multizone: {
      verdict: 'no',
      text: 'Page-level only. You cannot render a component from mfe-products inside a page owned by mfe-cart at runtime.',
    },
    moduleFed: {
      verdict: 'yes',
      text: 'Any component can be exposed and consumed across remote boundaries. A cart widget can live inside the products page.',
    },
  },
  {
    category: 'Shared state (EventBus, Zustand)',
    multizone: {
      verdict: 'partial',
      text: 'EventBus is in-memory — lost on zone navigation. Zustand persists via localStorage. CrossZoneBridge syncs across tabs via storage events.',
    },
    moduleFed: {
      verdict: 'yes',
      text: 'Same JS context. EventBus works in-memory across all remotes. Zustand store is a true singleton — no bridge needed.',
    },
  },
  {
    category: 'Build & webpack complexity',
    multizone: {
      verdict: 'yes',
      text: 'Zero webpack config. Each app is a plain next.config.ts with basePath + assetPrefix. No plugin, no NEXT_PRIVATE_LOCAL_WEBPACK.',
    },
    moduleFed: {
      verdict: 'no',
      text: 'Requires NextFederationPlugin in every app, NEXT_PRIVATE_LOCAL_WEBPACK=true, local webpack devDependency, and careful shared config.',
    },
  },
  {
    category: 'CORS setup',
    multizone: {
      verdict: 'yes',
      text: 'Not needed in production — all zones are behind the same canonical domain via rewrites. Dev-only CORS headers added for localhost.',
    },
    moduleFed: {
      verdict: 'no',
      text: 'Every remote must set Access-Control-Allow-Origin for the host origin so the browser can fetch remoteEntry.js and its chunks.',
    },
  },
  {
    category: 'TypeScript across boundaries',
    multizone: {
      verdict: 'yes',
      text: 'Full compile-time safety. @platform/shell and other packages are workspace deps — types are always in sync at build time.',
    },
    moduleFed: {
      verdict: 'partial',
      text: 'Requires DTS plugin or manual declare module stubs. Types can drift if remotes are deployed independently without coordinating.',
    },
  },
  {
    category: 'Independent deployments',
    multizone: {
      verdict: 'yes',
      text: 'Total isolation. Each zone deploys to its own Vercel project. The host rewrites update automatically via env vars — no host redeploy needed.',
    },
    moduleFed: {
      verdict: 'yes',
      text: 'Each remote deploys independently. Host downloads new remoteEntry.js at runtime. No host redeploy needed for remote-only changes.',
    },
  },
  {
    category: 'Runtime version conflicts',
    multizone: {
      verdict: 'yes',
      text: 'Impossible — zones are completely isolated. Each zone bundles its own React and dependencies. No shared runtime.',
    },
    moduleFed: {
      verdict: 'no',
      text: 'Breaking change in a shared singleton (e.g. React update) is a runtime crash, not a build error. Requires coordinated version bumps.',
    },
  },
  {
    category: 'Team isolation',
    multizone: {
      verdict: 'yes',
      text: 'Total. One team can use a different React version, different bundler, even a non-Next.js framework — the host just rewrites to their URL.',
    },
    moduleFed: {
      verdict: 'partial',
      text: 'Teams share the React version and all singleton deps. A major upgrade requires all teams to coordinate a simultaneous release.',
    },
  },
];

const VERDICT = {
  yes: {
    label: '✓ Yes',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  no: { label: '✗ No', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  partial: {
    label: '~ Partial',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
};

type Tab = 'comparison' | 'multizone' | 'modulefed';

export function MfeComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('comparison');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'comparison', label: 'Decision Matrix' },
    { id: 'multizone', label: 'Multi-Zone Diagram' },
    { id: 'modulefed', label: 'Module Federation Diagram' },
  ];

  return (
    <>
      <Button
        size="lg"
        variant="ghost"
        className="border border-white/20 text-white hover:bg-white/10"
        onClick={() => setIsOpen(true)}
      >
        Multi-Zone vs Module Federation
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="" size="xl">
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              MFE Architecture Decision
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Next.js Multi-Zone vs Webpack Module Federation — when to choose each
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              This platform uses Multi-Zone
            </div>
          </div>

          {/* Tab bar */}
          <div className="mb-5 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Decision Matrix ── */}
          {tab === 'comparison' && (
            <div>
              {/* Summary scorecard */}
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-brand-500 bg-brand-50 p-4 dark:bg-brand-900/20">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                      CURRENT
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">Multi-Zone</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Page-level isolation. Full App Router + RSC. Zero webpack config. Best for App
                    Router projects.
                  </p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {['App Router ✓', 'RSC ✓', 'Simple config ✓'].map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                      ALTERNATIVE
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Module Federation
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Component-level sharing. True SPA. Shared JS context. Best for Pages Router or
                    when SPA feel is required.
                  </p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {['SPA nav ✓', 'In-memory bus ✓', 'Pages Router ✓'].map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Criteria table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_120px_120px] gap-0 bg-gray-50 px-4 py-2.5 dark:bg-gray-800">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Criterion
                  </span>
                  <span className="text-center text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                    Multi-Zone
                  </span>
                  <span className="text-center text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    Module Fed.
                  </span>
                </div>

                {CRITERIA.map((c, i) => (
                  <div
                    key={c.category}
                    className={`group border-t border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
                  >
                    {/* Row header */}
                    <div className="grid grid-cols-[1fr_120px_120px] items-center gap-0 px-4 py-2.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {c.category}
                      </span>
                      <div className="flex justify-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VERDICT[c.multizone.verdict].className}`}
                        >
                          {VERDICT[c.multizone.verdict].label}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VERDICT[c.moduleFed.verdict].className}`}
                        >
                          {VERDICT[c.moduleFed.verdict].label}
                        </span>
                      </div>
                    </div>
                    {/* Expandable detail */}
                    <div className="grid grid-cols-2 gap-3 px-4 pb-3">
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {c.multizone.text}
                      </p>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {c.moduleFed.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decision guide */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-900/20">
                  <p className="mb-2 text-xs font-bold text-brand-700 dark:text-brand-300">
                    Choose Multi-Zone when:
                  </p>
                  <ul className="space-y-1">
                    {[
                      'Using Next.js App Router or RSC',
                      'Teams need total technology independence',
                      'Full-page reload between sections is acceptable',
                      'You want minimal webpack/bundler complexity',
                      'Different teams may use different frameworks',
                    ].map((t) => (
                      <li
                        key={t}
                        className="flex gap-1.5 text-xs text-brand-800 dark:text-brand-200"
                      >
                        <span className="mt-0.5 shrink-0 text-brand-500">›</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                  <p className="mb-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                    Choose Module Federation when:
                  </p>
                  <ul className="space-y-1">
                    {[
                      'Using Pages Router or non-Next.js apps',
                      'SPA feel (no reloads) is a hard requirement',
                      'A widget from one MFE must live inside another',
                      'Teams are comfortable coordinating React versions',
                      'You need true in-memory cross-MFE event passing',
                    ].map((t) => (
                      <li
                        key={t}
                        className="flex gap-1.5 text-xs text-purple-800 dark:text-purple-200"
                      >
                        <span className="mt-0.5 shrink-0 text-purple-500">›</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Multi-Zone Diagram ── */}
          {tab === 'multizone' && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
                  CURRENT APPROACH
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Next.js Multi-Zone
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl bg-gray-900 p-5 dark:bg-gray-950">
                <pre className="text-xs leading-relaxed text-green-400">{MULTIZONE_DIAGRAM}</pre>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Isolation level', value: 'Page-level', color: 'brand' },
                  { label: 'Cross-zone nav', value: 'Full-page reload', color: 'brand' },
                  { label: 'Webpack config', value: 'None required', color: 'brand' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-center dark:border-brand-800 dark:bg-brand-900/20"
                  >
                    <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Module Federation Diagram ── */}
          {tab === 'modulefed' && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-purple-600 px-2.5 py-1 text-xs font-bold text-white">
                  ALTERNATIVE
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Webpack Module Federation
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl bg-gray-900 p-5 dark:bg-gray-950">
                <pre className="text-xs leading-relaxed text-purple-300">
                  {MODULE_FEDERATION_DIAGRAM}
                </pre>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Isolation level', value: 'Component-level' },
                  { label: 'Cross-MFE nav', value: 'SPA (no reload)' },
                  { label: 'Webpack config', value: 'Required per app' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-800 dark:bg-purple-900/20"
                  >
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
