"use client";

import { toast } from "sonner";

export function toastApiErrorMessage(message: string) {
  toast.error(message);
}
