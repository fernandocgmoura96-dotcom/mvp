"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./use-toast";
import { Button } from "./button";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center space-y-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur",
          )}
        >
          <div className="flex-1 text-sm">
            {toast.title && <p className="font-medium text-foreground">{toast.title}</p>}
            {toast.description && (
              <p className="text-muted-foreground">{toast.description}</p>
            )}
          </div>
          <Button
            aria-label="Fechar notificação"
            variant="ghost"
            size="icon"
            onClick={() => dismiss(toast.id)}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  );
}
