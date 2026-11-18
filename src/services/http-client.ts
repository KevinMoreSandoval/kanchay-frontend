const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/backend' : 'http://localhost:8080')
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const multipart = options.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      credentials: path.startsWith('/auth/') ? 'include' : 'omit',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined && !multipart ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body !== undefined
        ? { body: multipart ? (options.body as FormData) : JSON.stringify(options.body) }
        : {}),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.'
    );
  }

  const text = await response.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Algunos endpoints devuelven texto en lugar de JSON.
  }

  if (!response.ok) {
    const error = data && typeof data === 'object' && 'error' in data ? data.error : null;
    const message = data && typeof data === 'object' && 'message' in data ? data.message : null;
    throw new ApiError(
      response.status,
      typeof error === 'string'
        ? error
        : typeof message === 'string'
          ? message
          : response.status === 401
            ? 'Tu sesión no es válida. Inicia sesión nuevamente.'
            : response.status === 403
              ? 'No tienes permisos para realizar esta acción.'
              : 'No se pudo completar la solicitud. Inténtalo nuevamente.'
    );
  }

  return data as T;
}
