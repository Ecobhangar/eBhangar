import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ebhangar.onrender.com/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(): HeadersInit {
  const user = auth.currentUser;
  const headers: HeadersInit = {};

  if (user?.phoneNumber) {
    headers["x-user-phone"] = user.phoneNumber;
  }

  return headers;
}

export async function apiRequest(method: string, url: string, data?: unknown) {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn =
  ({ on401 }: { on401: "returnNull" | "throw" }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("");
    const fullUrl = `${API_BASE_URL}${path}`;

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (on401 === "returnNull" && res.status === 401) return null;

    await throwIfResNotOk(res);
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
    mutations: { retry: false },
  },
});
