/** Raw API envelope — the shape the server returns before unwrapping. */
export interface ApiEnvelope<T = unknown> {
  error?: string;
  errorMessage?: string;
  data?: T;
  message?: T;
}
