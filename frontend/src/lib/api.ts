const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class ApiClient {
  private cache = new Map<string, CacheItem<any>>();
  private inFlight = new Map<string, Promise<any>>();

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('propfirm_token');
    }
    return null;
  }

  private clearCache() {
    this.cache.clear();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.error) || errorMessage;
      } catch {
        errorMessage = response.statusText || `HTTP Error ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  /**
   * High-concurrency GET with:
   * 1. 15-second client memory cache (skips duplicate network roundtrips)
   * 2. In-flight promise deduplication (simultaneous requests share 1 network call)
   */
  async get<T>(endpoint: string, query?: Record<string, any>, options: { bypassCache?: boolean; ttlMs?: number } = {}): Promise<T> {
    let url = endpoint;
    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const token = this.getToken();
    const cacheKey = `${token ? `auth:` : 'anon:'}${url}`;
    const now = Date.now();
    const ttl = options.ttlMs ?? 15_000; // 15 seconds default

    // 1. Check in-memory cache if not bypassed
    if (!options.bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.data as T;
      }
    }

    // 2. Check in-flight promise deduplication
    const activePromise = this.inFlight.get(cacheKey);
    if (activePromise) {
      return activePromise as Promise<T>;
    }

    // 3. Initiate request with promise deduplication
    const fetchPromise = this.request<T>(url, { method: 'GET' })
      .then((data) => {
        if (!options.bypassCache) {
          this.cache.set(cacheKey, {
            data,
            expiresAt: Date.now() + ttl,
          });
        }
        return data;
      })
      .finally(() => {
        this.inFlight.delete(cacheKey);
      });

    this.inFlight.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    this.clearCache();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    this.clearCache();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    this.clearCache();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    this.clearCache();
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    this.clearCache();
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient();
