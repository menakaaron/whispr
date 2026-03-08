"use client";

import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

let tokenGetter: (() => string | null) | null = null;

export function setApiTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

export async function apiCall<T = unknown>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = typeof tokenGetter === "function" ? tokenGetter() : null;

  const config: AxiosRequestConfig = {
    method,
    url,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined && body !== null && method !== "GET" ? { data: body } : {}),
  };

  const { data } = await axios.request<T>(config);
  return data;
}

export const api = {
  get: <T = unknown>(path: string) => apiCall<T>("GET", path),
  post: <T = unknown>(path: string, body?: unknown) => apiCall<T>("POST", path, body),
  put: <T = unknown>(path: string, body?: unknown) => apiCall<T>("PUT", path, body),
  patch: <T = unknown>(path: string, body?: unknown) => apiCall<T>("PATCH", path, body),
  delete: <T = unknown>(path: string) => apiCall<T>("DELETE", path),
};
