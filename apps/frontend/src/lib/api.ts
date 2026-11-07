
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
// The token lives in memory, not localStorage.
let accessToken: string | null = null;

// React will register these callbacks from AuthProvider.
let onTokenChange: (token: string | null) => void = () => {};
let onAuthFailure: () => void = () => {};

// Prevent multiple requests from refreshing at the same time.
let refreshPromise: Promise<string | null> | null = null;

export function configureApiAuth(callbacks: {
  onTokenChange: (token: string | null) => void;
  onAuthFailure: () => void;
}) {
  onTokenChange = callbacks.onTokenChange;
  onAuthFailure = callbacks.onAuthFailure;
}

function updateAccessToken(token: string | null) {
  accessToken = token;
  onTokenChange(token);
}

async function refreshAccessToken(): Promise<string | null> {
  // Reuse an existing refresh request if one is already running.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // IMPORTANT: use fetch directly here, not apiFetch.
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Adjust this field if your backend returns a different name.
      if (typeof data.accessToken !== "string") {
        return null;
      }

      updateAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
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

  // First attempt.
  const response = await fetch(`${API_URL}${path}`, requestOptions);

  // Only try refreshing on 401, and never refresh the refresh endpoint itself.
  if (response.status !== 401 || path === "/auth/refresh") {
    return response;
  }

  // Get a new access token.
  const newToken = await refreshAccessToken();

  if (!newToken) {
    onAuthFailure();
    return response;
  }

  // Retry the original request with the new token.
  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);

  const retryResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: retryHeaders,
    credentials: options.credentials ?? "include",
  });

  // If the retry is also unauthorized, end the local session.
  if (retryResponse.status === 401) {
    updateAccessToken(null);
    onAuthFailure();
  }

  return retryResponse;
}
