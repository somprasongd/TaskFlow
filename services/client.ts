export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
  }
}

interface RequestOptions extends RequestInit {
  data?: any;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshToken() {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) throw new Error('No refresh token');

  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Refresh failed');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const { data, headers, ...customOptions } = options;
  const accessToken = localStorage.getItem('accessToken');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...customOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, config);

  if (response.status === 401 && accessToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        onTokenRefreshed(newToken);
        isRefreshing = false;
      } catch (err) {
        isRefreshing = false;
        throw err;
      }
    }

    const retryOriginalRequest = new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        if (config.headers) {
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
        resolve(fetch(endpoint, config));
      });
    });

    const retryResponse = await (retryOriginalRequest as Promise<Response>);
    if (!retryResponse.ok) {
      const errorData = await retryResponse.json().catch(() => ({}));
      throw new ApiError(retryResponse.status, errorData.message || 'API Error', errorData);
    }
    return retryResponse.json();
  }

  if (!response.ok) {
    if (response.status === 204) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'API Error', errorData);
  }

  if (response.status === 204) return null;
  return response.json();
}
