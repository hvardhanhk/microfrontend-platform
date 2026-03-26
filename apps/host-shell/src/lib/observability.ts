/**
 * Observability setup — Sentry + Datadog placeholders.
 *
 * In production, install the actual SDKs:
 *   npm install @sentry/nextjs @datadog/browser-rum @datadog/browser-logs
 *
 * Then replace the stubs below with real initialization.
 */

// ─── Sentry ──────────────────────────────────────────────────────
interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
}

export function initSentry(_config?: Partial<SentryConfig>): void {
  const config: SentryConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    ..._config,
  };

  if (!config.dsn) {
    console.info('[Sentry] No DSN configured — skipping initialization');
    return;
  }

  // Placeholder: replace with actual Sentry.init() call
  console.info('[Sentry] Initialized', {
    environment: config.environment,
    release: config.release,
  });
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Placeholder: replace with Sentry.captureException(error, { extra: context })
  console.error('[Sentry] Capture exception:', error.message, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  // Placeholder: replace with Sentry.captureMessage(message, level)
  console.info(`[Sentry] [${level}] ${message}`);
}

// ─── Datadog RUM ─────────────────────────────────────────────────
interface DatadogConfig {
  applicationId: string;
  clientToken: string;
  site: string;
  service: string;
  env: string;
  sessionSampleRate: number;
  sessionReplaySampleRate: number;
  trackUserInteractions: boolean;
  trackResources: boolean;
  trackLongTasks: boolean;
}

export function initDatadog(_config?: Partial<DatadogConfig>): void {
  const config: DatadogConfig = {
    applicationId: process.env.NEXT_PUBLIC_DD_APP_ID || '',
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || '',
    site: 'datadoghq.com',
    service: 'platform-frontend',
    env: process.env.NODE_ENV || 'development',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    ..._config,
  };

  if (!config.applicationId || !config.clientToken) {
    console.info('[Datadog] No credentials configured — skipping initialization');
    return;
  }

  // Placeholder: replace with datadogRum.init(config)
  console.info('[Datadog] RUM initialized', {
    service: config.service,
    env: config.env,
  });
}

export function setDatadogUser(user: { id: string; email?: string; name?: string }): void {
  // Placeholder: replace with datadogRum.setUser(user)
  console.info('[Datadog] Set user:', user.id);
}
