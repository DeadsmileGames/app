import { Platform } from 'react-native';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://deadsmile.vercel.app/api').replace(/\/$/, '');
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://deadsmilegames.vercel.app').replace(/\/$/, '');

let csrfToken = null;
let csrfPromise = null;

export class ApiError extends Error {
  constructor(message, status = 0, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function getCsrfToken(force = false) {
  if (csrfToken && !force) return csrfToken;
  if (csrfPromise && !force) return csrfPromise;
  csrfPromise = fetch(`${API_URL}/csrf`, { credentials: 'include' })
    .then(async (res) => {
      const payload = await parseResponse(res);
      const token = payload?.data?.token;
      if (!res.ok || !token) throw new ApiError('Unable to initialize session security.', res.status, 'CSRF_INIT_FAILED');
      csrfToken = token;
      return token;
    })
    .finally(() => { csrfPromise = null; });
  return csrfPromise;
}

async function request(path, { method = 'GET', body, params, retryCsrf = true } = {}) {
  let url = `${API_URL}${path}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (query) url += `?${query}`;
  }
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers['X-CSRF-Token'] = await getCsrfToken();
  }
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    let message = 'Unable to access the API.';
    if (Platform.OS === 'android' && API_URL.includes('localhost')) {
      message += ' On Android, localhost points to the device; use your machine\'s IP address in .env.';
    }
    throw new ApiError(message, 0, 'NETWORK_ERROR');
  }
  const payload = await parseResponse(res);
  if (!res.ok) {
    const code = payload?.error?.code || 'UNKNOWN_ERROR';
    if (res.status === 403 && code === 'CSRF_VALIDATION_FAILED' && retryCsrf) {
      await getCsrfToken(true);
      return request(path, { method, body, params, retryCsrf: false });
    }
    throw new ApiError(payload?.error?.message || 'The request failed.', res.status, code);
  }
  return payload?.data;
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path, body) => request(path, { method: 'DELETE', body }),
};
