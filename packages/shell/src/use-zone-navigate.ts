/**
 * useZoneNavigate — cross-zone navigation hook.
 *
 * next/router and useRouter() only work within the same zone.
 * For cross-zone navigation (e.g. from mfe-products to /cart),
 * use window.location so the browser does a full-page navigation
 * through the host-shell rewrite.
 *
 * Usage:
 *   const navigate = useZoneNavigate();
 *   navigate('/cart', { params: { added: 'prod_1' } });
 */
export function useZoneNavigate() {
  return function navigate(
    path: string,
    options?: { params?: Record<string, string>; replace?: boolean },
  ) {
    let url = path;
    if (options?.params && Object.keys(options.params).length > 0) {
      const qs = new URLSearchParams(options.params).toString();
      url = `${path}?${qs}`;
    }
    if (options?.replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  };
}
