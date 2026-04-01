# Vercel Deployment Guide

This monorepo contains 4 independent Next.js apps. Each app is deployed as a **separate Vercel project** — one GitHub repo, four deployments. This is the foundation of Multi-Zone independence.

---

## Table of Contents

1. [How Vercel Knows Which App to Build](#1-how-vercel-knows-which-app-to-build)
2. [Pre-deployment Checklist](#2-pre-deployment-checklist)
3. [Step-by-Step: Create All 4 Vercel Projects](#3-step-by-step-create-all-4-vercel-projects)
4. [Environment Variables Per Project](#4-environment-variables-per-project)
5. [Wire the Projects Together](#5-wire-the-projects-together)
6. [Verify the Deployment](#6-verify-the-deployment)
7. [Ongoing: How Independent Deploys Work](#7-ongoing-how-independent-deploys-work)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. How Vercel Knows Which App to Build

This is the most important concept. Each Vercel project has its own `vercel.json` that overrides Vercel's auto-detection:

### Root `vercel.json` — host-shell project

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npx turbo build --filter=@platform/host-shell",
  "outputDirectory": "apps/host-shell/.next"
}
```

### `apps/mfe-products/vercel.json` — mfe-products project

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npx turbo build --filter=@platform/mfe-products",
  "outputDirectory": "apps/mfe-products/.next"
}
```

### `apps/mfe-cart/vercel.json` — mfe-cart project

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npx turbo build --filter=@platform/mfe-cart",
  "outputDirectory": "apps/mfe-cart/.next"
}
```

### `apps/mfe-user/vercel.json` — mfe-user project

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npx turbo build --filter=@platform/mfe-user",
  "outputDirectory": "apps/mfe-user/.next"
}
```

### What each field does

| Field             | Purpose                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `framework`       | Tells Vercel this is a Next.js app — enables ISR, Edge Functions, image optimization                                                                       |
| `installCommand`  | Runs `npm install` from the **monorepo root** — installs all workspaces including shared packages                                                          |
| `buildCommand`    | `turbo build --filter=@platform/mfe-products` builds only that app and its workspace dependencies (`@platform/shell`, `@platform/ui`, etc.) — nothing else |
| `outputDirectory` | Where Vercel finds the built `.next` folder to deploy                                                                                                      |

### Why `--filter` is the key

Without `--filter`, Turborepo would build all 4 apps on every deploy. The filter limits the build graph to exactly one app plus the packages it imports:

```
turbo build --filter=@platform/mfe-products

Builds:
  @platform/types         ← dependency of shared-state
  @platform/utils         ← dependency of ui
  @platform/ui            ← dependency of shell
  @platform/event-bus     ← dependency of shared-state
  @platform/shared-state  ← used by mfe-products
  @platform/shell         ← used by mfe-products
  @platform/mfe-products  ← the app itself

Skips:
  @platform/host-shell    ← not needed
  @platform/mfe-cart      ← not needed
  @platform/mfe-user      ← not needed
```

### How Vercel picks the right `vercel.json`

When you set **Root Directory** to `apps/mfe-products` in the Vercel project settings, Vercel:

1. Clones the full monorepo
2. Sets the working directory to `apps/mfe-products`
3. Reads `apps/mfe-products/vercel.json`
4. Runs `installCommand` from the **monorepo root** (one level up, because Vercel auto-detects the workspace root)
5. Runs `buildCommand` from the monorepo root
6. Deploys from `outputDirectory` (relative to the monorepo root)

The root `vercel.json` (for host-shell) has no `Root Directory` — Vercel uses the repo root and reads `vercel.json` there.

---

## 2. Pre-deployment Checklist

Before creating Vercel projects:

- [ ] Push all code to GitHub (main branch)
- [ ] Confirm `npm run build` passes locally for all apps
- [ ] Confirm all 4 `vercel.json` files exist at the correct paths
- [ ] Have a Vercel account (free tier works for all 4 projects)
- [ ] Have the GitHub repo accessible to your Vercel account

```bash
# Quick local build check
npx turbo build

# All 4 should show:
# ✓ Compiled successfully
# ✓ Generating static pages
```

---

## 3. Step-by-Step: Create All 4 Vercel Projects

You will import the same GitHub repository 4 times. Each import creates a separate project with a different configuration.

---

### Project 1: host-shell (the canonical domain)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** → select your GitHub repo
3. On the configuration screen:
   - **Project Name**: `platform-host-shell` (or any name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: leave **empty** (uses repo root)
   - **Build Command**: leave empty — Vercel reads from root `vercel.json`
   - **Output Directory**: leave empty — Vercel reads from root `vercel.json`
4. Skip environment variables for now (we'll add them after all 4 are deployed)
5. Click **Deploy**

> After deploy, note the URL: `platform-host-shell.vercel.app` (or your custom domain)

---

### Project 2: mfe-products

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same GitHub repo**
3. On the configuration screen:
   - **Project Name**: `platform-mfe-products`
   - **Framework Preset**: Next.js
   - **Root Directory**: click **Edit** → type `apps/mfe-products`
   - Build Command and Output Directory: leave empty — Vercel reads `apps/mfe-products/vercel.json`
4. Skip environment variables for now
5. Click **Deploy**

> Note the URL: `platform-mfe-products.vercel.app`

---

### Project 3: mfe-cart

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same GitHub repo**
3. Configuration:
   - **Project Name**: `platform-mfe-cart`
   - **Root Directory**: `apps/mfe-cart`
4. Click **Deploy**

> Note the URL: `platform-mfe-cart.vercel.app`

---

### Project 4: mfe-user

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same GitHub repo**
3. Configuration:
   - **Project Name**: `platform-mfe-user`
   - **Root Directory**: `apps/mfe-user`
4. Click **Deploy**

> Note the URL: `platform-mfe-user.vercel.app`

---

## 4. Environment Variables Per Project

Now that all 4 projects are deployed and you have their URLs, set environment variables in each Vercel project's **Settings → Environment Variables**.

### host-shell project

These tell the host-shell where to proxy `/products`, `/cart`, `/dashboard`:

| Variable                       | Value                   | Example                                    |
| ------------------------------ | ----------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_MFE_PRODUCTS_URL` | mfe-products Vercel URL | `https://platform-mfe-products.vercel.app` |
| `NEXT_PUBLIC_MFE_CART_URL`     | mfe-cart Vercel URL     | `https://platform-mfe-cart.vercel.app`     |
| `NEXT_PUBLIC_MFE_USER_URL`     | mfe-user Vercel URL     | `https://platform-mfe-user.vercel.app`     |

How to set:

1. Open the **host-shell** Vercel project
2. Go to **Settings → Environment Variables**
3. Add each variable — set Environment to **Production, Preview, Development**
4. Click **Save**

---

### mfe-products project

`assetPrefix` tells Next.js to emit absolute URLs for `_next/static` assets pointing at this zone's own origin (required because HTML is proxied through the host):

| Variable                   | Value                                      |
| -------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_ASSET_PREFIX` | `https://platform-mfe-products.vercel.app` |

---

### mfe-cart project

| Variable                   | Value                                  |
| -------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_ASSET_PREFIX` | `https://platform-mfe-cart.vercel.app` |

---

### mfe-user project

| Variable                   | Value                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_ASSET_PREFIX` | `https://platform-mfe-user.vercel.app`                                               |
| `NEXT_PUBLIC_HOST_URL`     | `https://platform-host-shell.vercel.app` _(optional — only needed for isolated dev)_ |

---

## 5. Wire the Projects Together

### Redeploy host-shell

After setting the environment variables, host-shell must redeploy to pick them up:

1. Open the **host-shell** Vercel project
2. Go to **Deployments**
3. Click the three-dot menu on the latest deployment → **Redeploy**

This is the **only time** you need to redeploy host-shell for a config change. After this, MFE teams deploy their zones independently — host-shell is not touched.

### (Optional) Add a custom domain

1. Open the **host-shell** Vercel project
2. Go to **Settings → Domains**
3. Add your domain: `yourapp.com`
4. Follow Vercel's DNS instructions (add CNAME or A record)

The MFE zones do **not** need custom domains — they are always accessed through the host-shell rewrite. Their `*.vercel.app` URLs are internal.

---

## 6. Verify the Deployment

Open your host-shell URL and test each zone:

```
https://yourapp.vercel.app/          ← host-shell home page
https://yourapp.vercel.app/products  ← proxied to mfe-products
https://yourapp.vercel.app/cart      ← proxied to mfe-cart
https://yourapp.vercel.app/dashboard ← proxied to mfe-user (redirects to /login if not authenticated)
```

### Check zone health

```
GET https://yourapp.vercel.app/api/zones/health
```

Expected response when all zones are up:

```json
{
  "status": "ok",
  "zones": [
    { "name": "mfe-products", "status": "ok", "code": 200 },
    { "name": "mfe-cart", "status": "ok", "code": 200 },
    { "name": "mfe-user", "status": "ok", "code": 200 }
  ],
  "timestamp": "..."
}
```

### Check zone contracts

```
GET https://yourapp.vercel.app/api/zones/info
```

Expected when all zones are on compatible shell versions:

```json
{
  "hostShellVersion": "1.0.0",
  "allCompatible": true,
  "zones": [...]
}
```

### Common issues at this stage

| Symptom                                                                   | Cause                                              | Fix                                                  |
| ------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| `/products` shows blank page                                              | `NEXT_PUBLIC_ASSET_PREFIX` not set in mfe-products | Add env var and redeploy mfe-products                |
| `/products` returns 404                                                   | `NEXT_PUBLIC_MFE_PRODUCTS_URL` wrong in host-shell | Check URL has no trailing slash, redeploy host-shell |
| `/dashboard` redirects to login correctly but login doesn't redirect back | `NEXT_PUBLIC_HOST_URL` not set in mfe-user         | Add env var pointing at host-shell URL               |
| Fonts missing in MFE pages                                                | `NEXT_PUBLIC_ASSET_PREFIX` set incorrectly         | Must be the zone's own Vercel URL, no trailing slash |
| `/api/zones/health` shows zone as unreachable                             | Health endpoint hasn't deployed yet                | Wait for MFE deployment to complete                  |

---

## 7. Ongoing: How Independent Deploys Work

After initial setup, every push to GitHub triggers only the Vercel project(s) whose **Root Directory** contains changed files.

### Example: mfe-products team ships a new feature

```
git commit -m "feat: add product reviews"
git push origin main
```

What happens:

```
GitHub push event
      │
      ├──► Vercel: platform-mfe-products
      │         Root Directory = apps/mfe-products
      │         Changed files include apps/mfe-products/**
      │         → BUILDS AND DEPLOYS mfe-products
      │
      ├──► Vercel: platform-host-shell
      │         Root Directory = / (root)
      │         No changed files under apps/host-shell/** or packages/**
      │         → SKIPS (no redeploy)
      │
      ├──► Vercel: platform-mfe-cart    → SKIPS
      └──► Vercel: platform-mfe-user    → SKIPS
```

The host-shell's rewrite still points to `NEXT_PUBLIC_MFE_PRODUCTS_URL` — it doesn't change. Users get the new mfe-products version on their next page load to `/products`. **Zero coordination required.**

### Example: shared package changes

```
# Team changes @platform/shell (packages/shell/)
git push origin main
```

What happens:

```
GitHub push event
      │
      ├──► All 4 Vercel projects trigger rebuild
      │    (packages/ is included in all root directories)
      │
      └──► All 4 apps rebuild with the new @platform/shell
```

This is correct — a shared package change could affect any zone.

### How Vercel detects changed files per project

Vercel compares the current commit against the last successful deployment for each project. It checks if any file within that project's **Root Directory** (or its dependencies) changed. If nothing changed, Vercel skips the build and instantly promotes the previous deployment.

---

## 8. Troubleshooting

### Build fails: "Cannot find module '@platform/shell'"

**Cause:** `installCommand` ran but npm workspaces didn't link the packages correctly.

**Fix:** Ensure `installCommand` is `npm install` (not `npm install --prefix apps/mfe-products`). Vercel must run install from the monorepo root so all workspace symlinks are created.

---

### Assets 404 after deploy (`_next/static/...` returns 404)

**Cause:** `NEXT_PUBLIC_ASSET_PREFIX` is not set or is set to the host-shell URL instead of the zone's own URL.

**Fix:**

```
mfe-products: NEXT_PUBLIC_ASSET_PREFIX = https://platform-mfe-products.vercel.app
mfe-cart:     NEXT_PUBLIC_ASSET_PREFIX = https://platform-mfe-cart.vercel.app
mfe-user:     NEXT_PUBLIC_ASSET_PREFIX = https://platform-mfe-user.vercel.app
```

After setting, redeploy **each MFE** (not host-shell). Then hard-refresh the browser (Cmd+Shift+R).

---

### `/dashboard` redirects to login but `?redirect=` param is lost

**Cause:** The mfe-user middleware redirects to `HOST_URL/login` but `NEXT_PUBLIC_HOST_URL` is empty.

**Fix:** In the mfe-user Vercel project, set:

```
NEXT_PUBLIC_HOST_URL = https://platform-host-shell.vercel.app
```

---

### Preview deployments break the rewrite proxy

**Cause:** On a PR, Vercel deploys mfe-products to a preview URL (`platform-mfe-products-git-feature-x.vercel.app`). The host-shell's `NEXT_PUBLIC_MFE_PRODUCTS_URL` still points at the production URL — so the preview host-shell serves production mfe-products, not the PR's version.

**Fix (manual):** Add the preview URL as an env var override in the host-shell's preview environment settings.

**Fix (automated):** Use Vercel's deployment protection and link preview deployments via the Vercel API in your CI pipeline — out of scope for most teams.

---

### Deployment order matters on first deploy

On the very first deploy, all 4 projects build before env vars are set (chicken-and-egg: you need the MFE URLs before host-shell is configured, but the MFEs need to be deployed to have URLs).

**Correct first-deploy order:**

1. Deploy mfe-products, mfe-cart, mfe-user (get their URLs)
2. Set env vars in host-shell (`NEXT_PUBLIC_MFE_*_URL`)
3. Set env vars in each MFE (`NEXT_PUBLIC_ASSET_PREFIX`)
4. Redeploy host-shell
5. Redeploy each MFE

After the first deploy, subsequent deploys are fully automatic.
