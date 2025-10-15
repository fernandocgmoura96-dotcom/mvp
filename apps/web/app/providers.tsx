"use client";

import type { PropsWithChildren } from "react";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toast";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}
