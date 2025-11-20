// client/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { auth } from "./firebase";

// CORRECT BASE URL (without /api)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ebhangar.onrender.com";

// Throw readable error
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Firebase phone header
function getAuthHeaders(): HeadersInit {
  const user = auth.currentUser;
  const headers: HeadersInit = {};
  if (user?.phoneNumber) headers["x-user-phone"] = user.phoneNumber;
  return headers;
}

// Generic fetcher
export async function apiRequest(method: string, url: string, data?: unknown) {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  // Auto Fix URL
  const cleanUrl = url.startsWith("/api") ? url : `/api${url}`;

  const fullUrl = `${API_BASE_URL}${cleanUrl}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res.json();
}

// Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) =>
        apiRequest("GET", queryKey[0] as string),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
    mutations: { retry: false },
  },
});
