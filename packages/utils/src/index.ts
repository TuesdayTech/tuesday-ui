import { clsx, type ClassValue } from 'clsx';

export { clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
