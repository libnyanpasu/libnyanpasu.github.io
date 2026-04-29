import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function chains<T>(...handlers: Array<((event: T) => void) | undefined>) {
  return (event: T) => {
    handlers.forEach((handler) => {
      if (handler) {
        handler(event);
      }
    });
  };
}
