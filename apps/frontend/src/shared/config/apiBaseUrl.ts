/** Public build-time setting, never a credential or an authorization decision. */
export function parseApiBaseUrl(value: string | undefined): string {
  const candidate = value ?? '/api';

  if (/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(candidate)) {
    return candidate;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(
      'VITE_API_BASE_URL must be a root-relative path or an HTTP(S) URL',
    );
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'VITE_API_BASE_URL must use HTTP(S) without credentials, query or fragment',
    );
  }

  return url.href.replace(/\/$/, '');
}
