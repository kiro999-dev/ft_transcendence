
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

let accessToken: string | null = null;


let onTokenChange: (token: string | null) => void = () => {};
let onAuthFailure: () => void = () => {};


let refreshPromise: Promise<string | null> | null = null;

export function configureApiAuth(callbacks: {
  onTokenChange: (token: string | null) => void;
  onAuthFailure: () => void;
}) {
  onTokenChange = callbacks.onTokenChange;
  onAuthFailure = callbacks.onAuthFailure;
}

export function updateAccessToken(token: string | null) {
  accessToken = token;
  onTokenChange(token);
}

export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (typeof data.accessToken !== "string") return null;

      updateAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials ?? "include",
  };


  const response = await fetch(`${API_URL}${path}`, requestOptions);


  if (response.status !== 401 || path === "/auth/refresh") {
    return response;
  }


  const newToken = await refreshAccessToken();

  if (!newToken) {
    updateAccessToken(null)
    onAuthFailure();
    return response;
  }

  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);

  const retryResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: retryHeaders,
    credentials: options.credentials ?? "include",
  });

  if (retryResponse.status === 401) {
    updateAccessToken(null);
    onAuthFailure();
  }

  return retryResponse;
}
