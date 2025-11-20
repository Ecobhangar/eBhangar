// client/src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

/**
 * API base URL
 * - Render par: VITE_API_URL=https://ebhangar.onrender.com/api
 * - Local dev:  http://localhost:10000/api
 */
const RAW_API_BASE =
  import.meta.env.VITE_API_URL || "https://ebhangar.onrender.com/api";

// trailing slash hata do
const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, "");

/** Join helper – yahan /api/api problem solve kar rahe hain */
function buildUrl(path: string): string {
  if (path.startsWith("http")) return path;

  // leading slash hatao
  let clean = path.replace(/^\/+/, "");

  // agar galti se "api/..." aaya ho to usko bhi kaat do
  if (clean.startsWith("api/")) {
    clean = clean.substring(4); // remove "api/"
  }

  return `${API_BASE_URL}/${clean}`;
}

/** Common error helper */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/** Firebase se phone number header bhejna (optional) */
function getAuthHeaders(): HeadersInit {
  const user = auth.currentUser;
  const headers: HeadersInit = {};

  if (user?.phoneNumber) {
    headers["x-user-phone"] = user.phoneNumber;
  }

  return headers;
}

/** Generic request helper (GET/POST/PATCH/DELETE) */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const fullUrl = buildUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/** JSON ke liye simple helper */
export async function apiGetJson<T>(url: string): Promise<T> {
  const res = await apiRequest("GET", url);
  return res.json() as Promise<T>;
}

/** React Query ke liye generic queryFn (optional use) */
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    const fullUrl = buildUrl(path);

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

/** Global query client */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
