export type ApiErrorCode =
  | "unauthorized"
  | "not_found"
  | "server_error"
  | "network_error"
  | "timeout"
  | "aborted"
  | "unknown";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number | undefined;
  readonly serverMessage: string | undefined;

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode?: number,
    serverMessage?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.serverMessage = serverMessage;
  }

  get isUnauthorized(): boolean {
    return this.code === "unauthorized";
  }

  get isNetworkError(): boolean {
    return this.code === "network_error";
  }
}
