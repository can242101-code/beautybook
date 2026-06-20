export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const TIMEOUT_MS  = 20_000;   // 20s por intento (Railway cold start puede tomar 30-60s)
const RETRY_DELAY = 5_000;
const MAX_RETRIES = 3;        // 4 intentos en total → presupuesto máximo ~95s

async function request(method, endpoint, body = null, attempt = 0) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bb-token') : null;

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timer);
    if (attempt < MAX_RETRIES) {
      // Notifica a la UI para mostrar feedback de reintento
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api:reintento', { detail: { intento: attempt + 1, total: MAX_RETRIES + 1 } }));
      }
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return request(method, endpoint, body, attempt + 1);
    }
    const err = new Error('El servidor tardó en responder. Por favor intenta de nuevo.');
    err.status = 0;
    throw err;
  }
  clearTimeout(timer);

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bb-token');
      window.dispatchEvent(new CustomEvent('bb:session-expired'));
    }
    const err = new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
    err.status = 401;
    throw err;
  }

  const data = res.status !== 204 ? await res.json() : null;

  if (!res.ok) {
    const err = new Error(data?.message || 'Error en la solicitud.');
    err.errors = data?.errors ?? {};
    err.status  = res.status;
    throw err;
  }

  return { data, status: res.status };
}

export const api = {
  get:    (url)       => request('GET',    url),
  post:   (url, body) => request('POST',   url, body),
  put:    (url, body) => request('PUT',    url, body),
  patch:  (url, body) => request('PATCH',  url, body),
  delete: (url)       => request('DELETE', url),
};
