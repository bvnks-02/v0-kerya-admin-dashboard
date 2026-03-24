import { ApiResponse, AuthTokens, AdminUserStats } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://app.alpha.openscaler.net:9281/api/v1';

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
    // Also set cookies for middleware
    document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=3600`;
    document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800`;
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Also clear cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
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

// Helper to check if error is due to token expiry
function isTokenExpiredError(responseData: any): boolean {
  if (!responseData) return false;
  
  // Check for token_not_valid code
  if (responseData.code === 'token_not_valid') {
    return true;
  }
  
  // Check for messages array with token expiry message
  if (Array.isArray(responseData.messages)) {
    return responseData.messages.some((msg: any) => 
      msg.message === 'Token is expired' || msg.message?.includes('expired')
    );
  }
  
  return false;
}

// Helper to redirect to login when session expires
function redirectToLogin() {
  clearTokens();
  if (typeof window !== 'undefined') {
    // Use window.location for a full page redirect to ensure middleware processes it
    window.location.href = '/login?session=expired';
  }
}

// Token refresh with better error handling
async function refreshAccessToken(): Promise<boolean> {
  const token = getRefreshToken();
  if (!token) {
    redirectToLogin();
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log('[v0] Token refresh failed. Redirecting to login.');
      redirectToLogin();
      return false;
    }

    const data = (await response.json()) as ApiResponse<AuthTokens>;
    if (data.data) {
      setTokens(data.data);
      console.log('[v0] Token refreshed successfully');
      return true;
    }
    
    console.log('[v0] Token refresh returned invalid data. Redirecting to login.');
    redirectToLogin();
    return false;
  } catch (error) {
    console.log('[v0] Token refresh error:', error);
    redirectToLogin();
    return false;
  }
}

// Main API request function
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiCall<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
  retries = 1
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

  const responseData = (await response.json()) as ApiResponse<T> | T;

  // Handle 401 (Unauthorized) or token expiry errors
  if ((response.status === 401 || isTokenExpiredError(responseData)) && !skipAuth && retries > 0) {
    console.log('[v0] Token expired or unauthorized. Attempting refresh...');
    
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        // Retry the request with the new token
        console.log('[v0] Retrying request with new token');
        return apiCall<T>(endpoint, options, retries - 1);
      }
    }
    // If refresh failed, redirectToLogin was already called, so just throw
  }

  if (!response.ok) {
    console.log('[v0] API Error:', { status: response.status, responseData });
    
    // Extract error message with fallback to detail field
    let errorMessage = 'API request failed';
    if (typeof responseData === 'object' && responseData !== null) {
      if ('detail' in responseData) {
        errorMessage = (responseData as any).detail;
      } else if ('message' in responseData) {
        errorMessage = (responseData as any).message;
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).data = responseData;
    throw error;
  }

  // Handle both wrapped response { data: T } and direct response T
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as ApiResponse<T>).data as T;
  }
  return responseData as T;
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

// Ticket management
export async function markTicketUsed<T = unknown>(ticketId: string): Promise<T> {
  return patch<T>(`/tickets/${ticketId}/set-state/?state=used`);
}

export async function expireTicket<T = unknown>(ticketId: string): Promise<T> {
  return patch<T>(`/tickets/${ticketId}/set-state/?state=expired`);
}

export async function validateTicket<T = unknown>(ticketId: string): Promise<T> {
  return patch<T>(`/tickets/${ticketId}/set-state/?state=valid`);
}

// Listing management
export async function updateListingStatus<T = unknown>(listingId: string, status: string): Promise<T> {
  return patch<T>(`/listings/${listingId}/`, { status });
}

// User management
export interface ListUsersParams {
  page?: number;
  page_size?: number;
  role?: 'guest' | 'host' | 'admin';
  status?: 'active' | 'inactive';
  verified?: 'email' | 'phone';
  search?: string;
}

export async function listUsers<T = unknown>(params?: ListUsersParams): Promise<T> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.role) queryParams.append('role', params.role);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.verified) queryParams.append('verified', params.verified);
  if (params?.search) queryParams.append('search', params.search);
  
  const query = queryParams.toString();
  return get<T>(`/admin/users/${query ? '?' + query : ''}`);
}

export async function getUserDetails<T = unknown>(userId: number): Promise<T> {
  return get<T>(`/admin/users/${userId}/`);
}

export async function updateUser<T = unknown>(
  userId: number,
  data: {
    role?: 'guest' | 'host' | 'admin';
    is_active?: boolean;
    is_staff?: boolean;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
  }
): Promise<T> {
  return patch<T>(`/admin/users/${userId}/`, data);
}

export async function banUser<T = unknown>(userId: number, reason?: string): Promise<T> {
  return post<T>(`/admin/users/${userId}/ban_user/`, { reason });
}

export async function unbanUser<T = unknown>(userId: number): Promise<T> {
  return post<T>(`/admin/users/${userId}/unban_user/`);
}

export async function promoteToHost<T = unknown>(userId: number): Promise<T> {
  return post<T>(`/admin/users/${userId}/promote_to_host/`);
}

export async function demoteToGuest<T = unknown>(userId: number): Promise<T> {
  return post<T>(`/admin/users/${userId}/demote_to_guest/`);
}

export async function getUserStats<T = unknown>(): Promise<T> {
  return get<T>(`/admin/users/stats/`);
}

// Dashboard stats - uses user stats as primary data source
export async function getDashboardStats(): Promise<AdminUserStats> {
  return getUserStats<AdminUserStats>();
}
