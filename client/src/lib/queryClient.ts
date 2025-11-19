// ===============================================
// ✅ client/src/lib/queryClient.ts (FINAL version)
// ===============================================

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

// ⬇️ Always use backend URL ONLY (Never frontend)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ebhangar.onrender.com/api";

// ------------------------------------------------
// 🔥 Helper: Throw error when API fails
// ------------------------------------------------
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// ------------------------------------------------
// 🔥 Attach Firebase phone header
// ------------------------------------------------
function getAuthHeaders(): HeadersInit {
  const user = auth.currentUser;
  const headers: HeadersInit = {};

  if (user?.phoneNumber) {
    headers["x-user-phone"] = user.phoneNumber;
  }

  return headers;
}

// ------------------------------------------------
// 🔥 Main request function for GET/POST/etc
// ------------------------------------------------
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const fullUrl =
    url.startsWith("http")
      ? url
      : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // IMPORTANT
  });

  await throwIfResNotOk(res);
  return res;
}

// ------------------------------------------------
// 🔥 React Query default fetcher
// ------------------------------------------------
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");

    const fullUrl =
      path.startsWith("http")
        ? path
        : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

// ------------------------------------------------
// 🔥 Global React Query client
// ------------------------------------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});
