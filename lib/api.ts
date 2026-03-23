import { ApiResponse, AuthTokens } from './types';

const API_BASE_URL = 'https://app.alpha.openscaler.net:9281/api/v1';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage (client-side only)
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

export function setTokens(tokens: AuthTokens) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined' && !accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined' && !refreshToken) {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
}

// Token refresh
async function refreshAccessToken(): Promise<boolean> {
  const token = getRefreshToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const data = (await response.json()) as ApiResponse<AuthTokens>;
    if (data.data) {
      setTokens(data.data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Main API request function
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiCall<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  console.log('[v0] API Call:', { endpoint, method: options.method || 'GET', url });
  
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  console.log('[v0] API Response:', { endpoint, status: response.status });

  // Handle 401 by refreshing token and retrying once
  if (response.status === 401 && !skipAuth) {
    console.log('[v0] Got 401, attempting token refresh');
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
        console.log('[v0] Retry after refresh:', { status: response.status });
      }
    }
  }

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    console.log('[v0] API Error:', { status: response.status, data });
    const error = new Error(data.message || 'API request failed');
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data.data as T;
}

// Convenience methods
export async function get<T = unknown>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

export async function post<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function deleteRequest<T = unknown>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}
