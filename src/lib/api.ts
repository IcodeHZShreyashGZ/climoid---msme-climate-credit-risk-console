export class ApiAuthError extends Error {
  constructor() {
    super('Authentication required');
    this.name = 'ApiAuthError';
  }
}

let token = '';
try {
  token = sessionStorage.getItem('climoid_token') || '';
} catch {
  token = '';
}

export function setToken(t: string) {
  token = t;
  try {
    sessionStorage.setItem('climoid_token', t);
  } catch {
    /* storage unavailable */
  }
}

export function hasToken() {
  return token.length > 0;
}

export async function apiFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) throw new ApiAuthError();
  return res;
}
