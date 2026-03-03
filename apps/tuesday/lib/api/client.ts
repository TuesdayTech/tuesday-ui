import { BASE_URL, REQUEST_TIMEOUT_MS } from "./constants";
import { ApiError } from "./errors";
import { tokenStore } from "./token";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export interface RequestOptions {
  method?: HttpMethod;
  body?: Record<string, unknown> | unknown[];
  query?: Record<string, string | number | boolean | undefined>;
  /** Key to unwrap response from. "data" (default), "message", or null for raw body. */
  responseKey?: string | null;
  /** When true, injects tuesday-token header. */
  requiresAuth?: boolean;
  signal?: AbortSignal;
  timeout?: number;
}

interface ApiEnvelope {
  error?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

/** Truncate API response for readable dev logs. */
function summarizeResponse(json: unknown): unknown {
  if (Array.isArray(json)) {
    return `[Array(${json.length})]`;
  }
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        out[key] = `[Array(${value.length})]`;
      } else if (value && typeof value === "object") {
        out[key] = "{...}";
      } else if (typeof value === "string" && value.length > 80) {
        out[key] = value.slice(0, 80) + "...";
      } else {
        out[key] = value;
      }
    }
    return out;
  }
  return json;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    responseKey = "data",
    requiresAuth = false,
    signal,
    timeout = REQUEST_TIMEOUT_MS,
  } = options;

  // Build URL
  const url = new URL(`${BASE_URL}/${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // Headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (requiresAuth) {
    const token = await tokenStore.get();
    if (token) {
      headers["tuesday-token"] = token;
    }
  }

  // Abort controller for timeout
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  // Merge external signal with timeout controller
  // (AbortSignal.any is not available in Hermes)
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  const mergedSignal = controller.signal;

  const finalUrl = url.toString();
  if (__DEV__) {
    console.log(`[API] ${method} ${finalUrl}`);
  }

  let response: Response;
  try {
    response = await fetch(finalUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: mergedSignal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === "AbortError") {
      if (timedOut) {
        if (__DEV__) console.warn(`[API] TIMEOUT ${finalUrl}`);
        throw new ApiError("timeout", "Request timed out");
      }
      throw new ApiError("aborted", "Request aborted");
    }
    if (__DEV__) {
      console.error(`[API] FETCH ERROR:`, {
        name: (error as Error).name,
        message: (error as Error).message,
        url: finalUrl,
      });
    }
    throw new ApiError("network_error", "Network request failed");
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse JSON
  let json: ApiEnvelope;
  try {
    json = (await response.json()) as ApiEnvelope;
  } catch {
    throw new ApiError("unknown", `Failed to parse response (${response.status})`);
  }

  if (__DEV__) {
    const summary = summarizeResponse(json);
    console.log(`[API] ${response.status} ${url.pathname}`, summary);
  }

  // HTTP errors
  if (!response.ok) {
    const serverMsg = json.errorMessage ?? json.error ?? undefined;
    if (response.status === 401) {
      throw new ApiError("unauthorized", "Unauthorized", 401, serverMsg);
    }
    if (response.status === 404) {
      throw new ApiError("not_found", "Not found", 404, serverMsg);
    }
    if (response.status >= 500) {
      throw new ApiError("server_error", "Server error", response.status, serverMsg);
    }
    throw new ApiError("unknown", serverMsg ?? "Request failed", response.status);
  }

  // Application-level errors (200 OK but error field present)
  if (json.error || json.errorMessage) {
    throw new ApiError(
      "unknown",
      (json.errorMessage ?? json.error) as string,
    );
  }

  // Unwrap
  if (responseKey === null) {
    return json as T;
  }

  return json[responseKey] as T;
}

export const api = { request };
