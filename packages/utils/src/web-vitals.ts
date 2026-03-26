/**
 * Report Core Web Vitals (LCP, CLS, INP) to analytics.
 * In production, forward to Datadog RUM or a custom endpoint.
 */
export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  rating: string;
}): void {
  const { name, value, id, rating } = metric;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Web Vitals] ${name}: ${Math.round(value)} (${rating})`, { id });
  }

  // Production: send to analytics endpoint via sendBeacon for reliability
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    const body = JSON.stringify({ name, value, id, rating, timestamp: Date.now() });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(process.env.NEXT_PUBLIC_ANALYTICS_URL, body);
    }
  }
}
