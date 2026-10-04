const PROD_RENDER_API_URL = 'https://propnation-backend.onrender.com';

function resolveApiBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalHost && (!envUrl || envUrl.includes('localhost'))) {
      return PROD_RENDER_API_URL;
    }
  } else if (process.env.NODE_ENV === 'production' && (!envUrl || envUrl.includes('localhost'))) {
    return PROD_RENDER_API_URL;
  }
  return envUrl || 'http://localhost:4000';
}

const API_BASE_URL = resolveApiBaseUrl();

interface CacheItem<T> {
  data: T;
  expiresAt: number;
  staleUntil: number;
}

const STORAGE_CACHE_PREFIX = 'propfirm_cache_v2:';
const DEFAULT_FRESH_TTL_MS = 60_000; // 60 seconds fresh
const DEFAULT_STALE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours stale-while-revalidate
const GET_TIMEOUT_MS = 1_200; // 1.2 seconds max wait before falling back
const MUTATION_TIMEOUT_MS = 1_500; // 1.5 seconds max wait for mutations
const OFFLINE_COOLDOWN_MS = 60_000; // 60s fast-fail circuit breaker when backend is unreachable

class ApiClient {
  private cache = new Map<string, CacheItem<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private warmedUp = false;
  private backendOfflineUntil = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.hydrateFromStorage();
      this.warmUpBackend();
    }
  }

  private warmUpBackend() {
    if (this.warmedUp || typeof window === 'undefined') return;
    this.warmedUp = true;
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), 1_000) : null;
    // Non-blocking ping to check/wake up backend instance immediately
    fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      signal: ctrl?.signal,
    })
      .then(() => {
        this.backendOfflineUntil = 0;
      })
      .catch(() => {
        this.backendOfflineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
      })
      .finally(() => {
        if (t) clearTimeout(t);
      });
  }

  private hydrateFromStorage() {
    try {
      const now = Date.now();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_CACHE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw) as CacheItem<any>;
          if (parsed && parsed.staleUntil > now) {
            const cacheKey = key.slice(STORAGE_CACHE_PREFIX.length);
            this.cache.set(cacheKey, parsed);
          } else {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {
      // Ignore storage quota or private browsing errors
    }
  }

  private saveToStorage(cacheKey: string, item: CacheItem<any>) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_CACHE_PREFIX}${cacheKey}`, JSON.stringify(item));
    } catch {
      // Ignore storage quota errors
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token');
    }
    return null;
  }

  public clearCache() {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_CACHE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, timeoutMs = MUTATION_TIMEOUT_MS): Promise<T> {
    // Fast-fail in 0ms if backend is currently marked unreachable
    if (this.backendOfflineUntil > Date.now()) {
      throw new Error('Backend offline (fast-fail cache active)');
    }

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

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer =
      controller && timeoutMs
        ? setTimeout(() => {
            controller.abort();
          }, timeoutMs)
        : null;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller ? controller.signal : options.signal,
      });

      this.backendOfflineUntil = 0;

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message ||
            (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.error) ||
            errorMessage;
        } catch {
          errorMessage = response.statusText || `HTTP Error ${response.status}`;
        }
        const error: any = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (err: any) {
      // If fetch threw a network error or AbortError, trip the circuit breaker so future calls resolve in 0ms
      if (!err.status) {
        this.backendOfflineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
      }
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Instant Stale-While-Revalidate GET:
   * 1. Returns fresh cached data in 0ms.
   * 2. If cached data is stale (up to 24h), returns stale data immediately in 0ms AND refreshes in background!
   * 3. Deduplicates simultaneous in-flight network requests.
   * 4. Enforces a fast 5s timeout so cold-starting servers never block the UI.
   */
  async get<T>(
    endpoint: string,
    query?: Record<string, any>,
    options: { bypassCache?: boolean; ttlMs?: number; timeoutMs?: number } = {}
  ): Promise<T> {
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
    const cacheKey = `${token ? `auth:${token.slice(-12)}:` : 'anon:'}${url}`;
    const now = Date.now();
    const ttl = options.ttlMs ?? DEFAULT_FRESH_TTL_MS;
    const timeoutMs = options.timeoutMs ?? GET_TIMEOUT_MS;

    const performNetworkFetch = (): Promise<T> => {
      const existing = this.inFlight.get(cacheKey);
      if (existing) return existing as Promise<T>;

      const promise = this.request<T>(url, { method: 'GET' }, timeoutMs)
        .then((data) => {
          const item: CacheItem<T> = {
            data,
            expiresAt: Date.now() + ttl,
            staleUntil: Date.now() + DEFAULT_STALE_TTL_MS,
          };
          this.cache.set(cacheKey, item);
          this.saveToStorage(cacheKey, item);
          return data;
        })
        .finally(() => {
          this.inFlight.delete(cacheKey);
        });

      this.inFlight.set(cacheKey, promise);
      return promise;
    };

    if (!options.bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        if (cached.expiresAt > now) {
          // Fresh hit -> 0ms return
          return cached.data as T;
        }
        if (cached.staleUntil > now) {
          // Stale hit -> 0ms instant return + silent background revalidation
          performNetworkFetch().catch(() => {});
          return cached.data as T;
        }
      }
    }

    return performNetworkFetch();
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

