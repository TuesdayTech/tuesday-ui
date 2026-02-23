import type { Profile } from "./profile";

/** Response from POST auth/login — returned at the top level (no envelope). */
export interface LoginResponse {
  token: string;
  message: Profile;
}

/** Response from POST auth/smsCheck. */
export interface SmsCheckResponse {
  message: string;
}
