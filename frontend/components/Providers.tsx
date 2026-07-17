"use client";

import { DialogProvider } from "@/components/ui/Dialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DialogProvider>{children}</DialogProvider>;
}
