const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function request(method, endpoint, body = null) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bb-token') : null;

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    err.status = 0;
    throw err;
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bb-token');
      // Notifica a AuthContext para limpiar el estado y redirigir al login.
      // Esto cubre tanto la verificación inicial como la expiración mid-session.
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
