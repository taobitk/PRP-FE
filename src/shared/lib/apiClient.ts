import { env } from '@/shared/config/env'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API Error: ${status}`)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl = env.API_BASE_URL.endsWith('/') ? env.API_BASE_URL.slice(0, -1) : env.API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  
  let authHeader = {};
  if (typeof window !== 'undefined') {
    // Thử lấy từ localStorage trực tiếp nếu require không hoạt động
    try {
      const authStr = localStorage.getItem('auth-storage');
      if (authStr) {
        const authData = JSON.parse(authStr);
        const token = authData?.state?.accessToken;
        if (token) {
          authHeader = { Authorization: `Bearer ${token}` };
        }
      }
    } catch (e) {
      console.warn("Failed to get auth token from localStorage", e);
    }
  }

  const res = await fetch(url, {
    ...options,
    cache: 'no-store', // Vô hiệu hóa cache để tránh dữ liệu cũ (đặc biệt là profile)
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options?.headers,
    },
  })
  
  if (authHeader && (authHeader as any).Authorization) {
    console.log(`[API AUTH] Token used for ${endpoint}`);
  }

  if (res.status === 401) {
    // TODO: Implement token refresh logic
    const errorData = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new ApiError(401, errorData)
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') ?? '5'
    throw new ApiError(429, { message: `Rate limited. Retry after ${retryAfter}s` })
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    console.error(`[API ERROR] ${res.status} ${endpoint}:`, errorData);
    throw new ApiError(res.status, errorData);
  }

  if (res.status === 204) {
    return null as T
  }

  const data = await res.json().catch(() => null);
  console.log(`[API Response] ${res.status} ${endpoint}:`, data);
  return data;
}
