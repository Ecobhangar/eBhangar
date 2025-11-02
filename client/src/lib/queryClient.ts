// ✅ client/src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

/**
 * ✅ API Base URL
 * - In production, it will point to your live Render backend.
 * - In development, you can set VITE_API_URL=http://localhost:5000 in .env
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ebhangar.onrender.com";

/**
 * ✅ Utility to throw readable errors for failed fetch calls
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * ✅ Automatically attaches Firebase user's phone number header
 * - The backend can identify logged-in users with this header.
 */
function getAuthHeaders(): HeadersInit {
  const user = auth.currentUser;
  const headers: HeadersInit = {};

  if (user?.phoneNumber) {
    headers["x-user-phone"] = user.phoneNumber;
  }

  return headers;
}

/**
 * ✅ Generic API request wrapper for GET/POST/PATCH/DELETE
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  // Ensure URL is absolute
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * ✅ Query function helper for react-query hooks
 */
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    const fullUrl = path.startsWith("http")
      ? path
      : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

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

/**
 * ✅ Create a global react-query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
