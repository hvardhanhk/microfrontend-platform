'use client';

import { Modal, Button, Badge } from '@platform/ui';
import { useState } from 'react';

const steps = [
  {
    number: 1,
    title: 'Install Webpack Module Federation Plugin',
    tech: ['@module-federation/enhanced', 'Webpack 5', 'Next.js'],
    description:
      'Module Federation (MF) is a Webpack 5 feature that lets separately built and deployed bundles share code at runtime — without rebuilding the host. Use @module-federation/enhanced (MF 2.0) which has better TypeScript support than the legacy nextjs-mf package.',
    tradeoff: 'warning',
    tradeoffText:
      'App Router + RSC support is still immature in MF 2.0 as of 2025. Pages Router works reliably. If you need App Router, Multi-Zone is the safer choice.',
    details: [
      'npm install @module-federation/enhanced — do NOT use @module-federation/nextjs-mf (blocks App Router)',
      'Add NEXT_PRIVATE_LOCAL_WEBPACK=true at the top of each next.config.js (before any require calls)',
      'Add "webpack": "^5.0.0" to devDependencies in each app — Next.js needs a local webpack copy',
      'Each app that exposes components is a "remote"; apps that consume them are "hosts"',
      'Both host and remotes use the NextFederationPlugin — remotes expose, hosts declare remotes',
    ],
    diagram: `# Install in every app (host + each remote)
npm install @module-federation/enhanced
npm install --save-dev webpack

# next.config.js (must be .js not .ts for this plugin)
# Top of file — before any require():
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = 'true';

const { NextFederationPlugin } = require(
  '@module-federation/enhanced/next'
);`,
  },
  {
    number: 2,
    title: 'Configure Each MFE as a Remote (Expose)',
    tech: ['NextFederationPlugin', 'exposes', 'filename'],
    description:
      'Each MFE app configures NextFederationPlugin to expose specific components. The plugin generates a remoteEntry.js file that the host downloads at runtime to discover and load the exposed modules. Each remote must have a unique name.',
    tradeoff: null,
    tradeoffText: '',
    details: [
      'name: must be unique across all federated apps — used as the import identifier in the host',
      'filename: "static/chunks/remoteEntry.js" — the manifest file the host downloads',
      'exposes: maps a public alias to the actual file path. e.g. "./ProductGrid" → "./src/components/ProductGrid"',
      'shared: list react, react-dom, and all @platform/* packages as singletons to avoid duplicate instances',
      "The exposed component must be a default export and must work in the host's React version",
    ],
    diagram: `// apps/mfe-products/next.config.js
const { NextFederationPlugin } = require(
  '@module-federation/enhanced/next'
);

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'mfe_products',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductGrid':
            './src/components/product-grid',
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true },
          '@platform/shared-state': { singleton: true },
        },
      })
    );
    return config;
  },
};`,
  },
  {
    number: 3,
    title: 'Configure the Host Shell to Consume Remotes',
    tech: ['remotes', 'NextFederationPlugin', 'dynamic import'],
    description:
      "The host shell declares where each remote's remoteEntry.js is located. At runtime, when the user navigates to /products, the host downloads that manifest from the remote URL and then loads only the specific exposed module it needs.",
    tradeoff: null,
    tradeoffText: '',
    details: [
      'remotes maps the remote name to its URL: "mfe_products@http://localhost:3001/_next/static/chunks/remoteEntry.js"',
      "The URL must be the deployed remote's origin — use env vars so it doesn't need hardcoding",
      'host-shell also needs filename: "static/chunks/remoteEntry.js" even if it doesn\'t expose anything',
      'In the host, import the remote component with next/dynamic to get SSR + code splitting',
      'Wrap with React.Suspense and an error boundary — the remote may fail to load (network error, version mismatch)',
    ],
    diagram: `// apps/host-shell/next.config.js
const MFE_PRODUCTS_URL =
  process.env.NEXT_PUBLIC_MFE_PRODUCTS_URL
  ?? 'http://localhost:3001';

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'host_shell',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          mfe_products:
            \`mfe_products@\${MFE_PRODUCTS_URL}/_next/static/chunks/remoteEntry.js\`,
          mfe_cart:
            \`mfe_cart@\${MFE_CART_URL}/_next/static/chunks/remoteEntry.js\`,
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true },
        },
      })
    );
    return config;
  },
};`,
  },
  {
    number: 4,
    title: 'Consume Remote Components with next/dynamic',
    tech: ['next/dynamic', 'React.Suspense', 'Error Boundary'],
    description:
      "In the host shell's page, use next/dynamic to import components from the remote. The dynamic import syntax uses the remote name and exposed key you configured. This gives you SSR support (if the remote supports it) and automatic code splitting.",
    tradeoff: null,
    tradeoffText: '',
    details: [
      'import() path must exactly match: "remoteName/exposedKey" — e.g. "mfe_products/ProductGrid"',
      'ssr: false disables server-side rendering of the remote — simpler but loses SSR benefits',
      'ssr: true requires the remote to also be running on the server (more complex deployment)',
      'Add a Suspense boundary with a skeleton fallback — the remote chunk loads asynchronously',
      'Wrap in an ErrorBoundary — if the remote is down, show a graceful fallback instead of crashing the host',
    ],
    diagram: `// apps/host-shell/src/app/products/page.tsx
import dynamic from 'next/dynamic';

const ProductGrid = dynamic(
  () => import('mfe_products/ProductGrid'),
  {
    ssr: false,       // set true if remote supports SSR
    loading: () => (
      <div className="animate-pulse h-64 bg-gray-100" />
    ),
  }
);

export default function ProductsPage() {
  return (
    <ErrorBoundary fallback={<p>Products unavailable</p>}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </ErrorBoundary>
  );
}`,
  },
  {
    number: 5,
    title: 'Share State Across Federated Modules',
    tech: ['singleton: true', 'Zustand', 'shared config', 'globalThis'],
    description:
      'Module Federation can cause duplicate React instances if shared packages are not declared as singletons. Each remote that imports React will get its own copy unless you explicitly mark packages as shared singletons. State management requires extra care.',
    tradeoff: 'danger',
    tradeoffText:
      "If React or a state store is not marked singleton:true, you get two independent React trees in the same page — hooks fail, context doesn't cross boundaries, and debugging is extremely difficult.",
    details: [
      "Mark react, react-dom as singleton: true, eager: true in every app's shared config",
      'Mark @platform/shared-state as singleton: true so all modules share one Zustand instance',
      'requiredVersion: "^19.0.0" — enforce a compatible version range across all remotes',
      "eager: true for the host's shared packages — loads them before any remote module runs",
      'The EventBus on globalThis.__PLATFORM_EVENT_BUS__ works across MF boundaries naturally (same JS context, unlike Multi-Zone)',
    ],
    diagram: `// Shared config used in EVERY app's NextFederationPlugin
const sharedDeps = {
  react: {
    singleton: true,
    eager: true,
    requiredVersion: '^19.0.0',
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^19.0.0',
  },
  '@platform/shared-state': {
    singleton: true,    // one Zustand store for all
  },
  '@platform/event-bus': {
    singleton: true,    // one EventBus instance
  },
  '@platform/ui': {
    singleton: true,    // one copy of UI components
  },
};

// Same object passed to every plugin instance
new NextFederationPlugin({ ..., shared: sharedDeps })`,
  },
  {
    number: 6,
    title: 'Handle TypeScript Types for Remote Modules',
    tech: ['@module-federation/dts-plugin', 'declare module', 'typeRoots'],
    description:
      'TypeScript doesn\'t know about remote modules — imports like "mfe_products/ProductGrid" will show type errors. You need either auto-generated type stubs from the DTS plugin or manual ambient declarations.',
    tradeoff: null,
    tradeoffText: '',
    details: [
      "Option A: @module-federation/dts-plugin generates .d.ts files from the remote's exposed types automatically",
      'Option B: Add manual ambient declarations in a types/remotes.d.ts file (simpler but requires manual updates)',
      'For each exposed module, declare its props interface so the host gets full autocomplete',
      'Add the types directory to tsconfig.json typeRoots or include array',
      'The DTS plugin runs as part of the webpack build — remote types are fetched from the running remote server',
    ],
    diagram: `// Option B — manual: types/remotes.d.ts in host-shell

declare module 'mfe_products/ProductGrid' {
  import type { FC } from 'react';
  interface ProductGridProps {
    initialCategory?: string;
  }
  const ProductGrid: FC<ProductGridProps>;
  export default ProductGrid;
}

declare module 'mfe_cart/CartView' {
  import type { FC } from 'react';
  const CartView: FC;
  export default CartView;
}

// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./types", "./node_modules/@types"]
  }
}`,
  },
  {
    number: 7,
    title: 'Deploy Each Remote Independently',
    tech: ['Vercel', 'CORS', 'remoteEntry.js', 'env vars'],
    description:
      "Each remote (mfe-products, mfe-cart, mfe-user) is deployed to its own Vercel project. The host shell's env vars point to the deployed remote URLs. A new version of mfe-products can be deployed without touching the host shell — the host downloads the new remoteEntry.js on the next page load.",
    tradeoff: 'warning',
    tradeoffText:
      "Unlike Multi-Zone, Module Federation loads remote JS directly into the host's page. The remote MUST enable CORS headers so the host origin can fetch the remoteEntry.js and its chunks.",
    details: [
      'Deploy each app to its own Vercel project (same as Multi-Zone) — each gets its own URL',
      "Set NEXT_PUBLIC_MFE_PRODUCTS_URL in the host-shell Vercel project to the remote's URL",
      'Enable CORS on all remotes: add Access-Control-Allow-Origin: <host-origin> to all /_next/* routes',
      'The host shell does NOT need to redeploy when a remote ships — it fetches the new remoteEntry.js at runtime',
      'Version negotiation: if the host expects ProductGrid props that the new remote removed, it will crash at runtime — no compile-time safety across deployment boundaries',
    ],
    diagram: `// Remote's next.config.js — CORS for production
async headers() {
  return [{
    source: '/_next/:path*',
    headers: [{
      key: 'Access-Control-Allow-Origin',
      value: 'https://yourapp.vercel.app',
    }],
  }];
},

// Host-shell Vercel env vars:
NEXT_PUBLIC_MFE_PRODUCTS_URL=https://mfe-products-xxx.vercel.app
NEXT_PUBLIC_MFE_CART_URL=https://mfe-cart-xxx.vercel.app

// Runtime loading flow:
// 1. User visits yourapp.vercel.app/products
// 2. Host renders ProductsPage → hits dynamic import
// 3. Browser fetches remoteEntry.js from mfe-products.vercel.app
// 4. remoteEntry.js registers mfe_products container
// 5. Host loads ProductGrid chunk from remote
// 6. Component renders — no host redeploy needed`,
  },
  {
    number: 8,
    title: 'Multi-Zone vs Module Federation — Trade-offs',
    tech: ['Architecture Decision', 'Trade-offs'],
    description:
      'Both approaches achieve independent MFE deployments. The right choice depends on whether you need component-level sharing (MF) or are happy with page-level isolation (Multi-Zone). This platform uses Multi-Zone because it fully supports App Router and RSC with zero webpack complexity.',
    tradeoff: null,
    tradeoffText: '',
    details: [
      'Multi-Zone: page-level isolation, full App Router + RSC support, no webpack config, full-page nav between zones',
      'Module Federation: component-level sharing, same-page composition, SPA feel, but App Router support is immature',
      'Multi-Zone cross-zone nav = full reload. Module Federation = true SPA, no reload when switching MFEs',
      'Module Federation shares a JS context — EventBus works in-memory across MFEs. Multi-Zone needs localStorage bridge',
      'Module Federation version conflicts are runtime errors. Multi-Zone teams are fully isolated — no shared runtime',
      'For new App Router projects in 2025: choose Multi-Zone. For Pages Router or legacy codebases: MF is mature and proven',
    ],
    diagram: `                 Multi-Zone     Module Fed.
─────────────────────────────────────────────
App Router + RSC    ✅ Full        ⚠️  Partial
SPA navigation      ❌ Full reload ✅ Same page
Component sharing   ❌ Page-level  ✅ Component
Shared JS context   ❌ No          ✅ Yes
EventBus in-memory  ❌ No          ✅ Yes
Webpack complexity  ✅ None        ⚠️  High
CORS setup needed   ✅ None        ⚠️  Yes
Runtime type safety ✅ Build time  ❌ Runtime only
Team isolation      ✅ Total       ⚠️  Shared deps
─────────────────────────────────────────────
This platform uses: Multi-Zone ✅`,
  },
];

export function ModuleFederationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <>
      <Button
        size="lg"
        variant="ghost"
        className="text-white hover:bg-white/10"
        onClick={() => setIsOpen(true)}
      >
        Module Federation Guide
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="" size="xl">
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Implementing MFE with Webpack Module Federation
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Step-by-step guide to using @module-federation/enhanced instead of Next.js Multi-Zone
            </p>
          </div>

          {/* Step navigation */}
          <div className="mb-6 flex flex-wrap justify-center gap-1.5">
            {steps.map((step, i) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeStep === i
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {step.number}
              </button>
            ))}
          </div>

          {/* Active step content */}
          {(() => {
            const step = steps[activeStep];
            return (
              <div>
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {step.tech.map((t) => (
                        <Badge key={t} variant="info">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>

                {/* Trade-off callout */}
                {step.tradeoff && (
                  <div
                    className={`mb-4 rounded-lg border p-3 text-sm ${
                      step.tradeoff === 'danger'
                        ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                    }`}
                  >
                    <span className="font-semibold">
                      {step.tradeoff === 'danger' ? '⚠ Critical: ' : '⚠ Note: '}
                    </span>
                    {step.tradeoffText}
                  </div>
                )}

                {/* Code / diagram */}
                <div className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 dark:bg-gray-950">
                  <pre className="text-xs leading-relaxed text-green-400">{step.diagram}</pre>
                </div>

                {/* Implementation details */}
                <div className="mb-6">
                  <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
                    disabled={activeStep === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-400">
                    {activeStep + 1} / {steps.length}
                  </span>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setActiveStep((p) => Math.min(steps.length - 1, p + 1))}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setIsOpen(false)}>
                      Close
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>
    </>
  );
}
