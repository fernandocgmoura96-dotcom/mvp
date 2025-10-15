"use client";

import { cn } from "@/lib/utils";
import { useDesignStore } from "@/lib/store";

const steps = [
  { id: 1, title: "Produto & Arte" },
  { id: 2, title: "Posicionamento" },
  { id: 3, title: "Modelo de IA" },
  { id: 4, title: "Resultados" },
];

export function Stepper() {
  const step = useDesignStore((state) => state.step);

  return (
    <nav aria-label="Progresso do wizard" className="mb-6">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {steps.map((item) => {
          const isActive = step === item.id;
          const isComplete = step > item.id;
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition",
                isActive && "border-primary bg-primary/10 text-primary",
                isComplete && !isActive && "border-muted bg-muted text-muted-foreground",
                !isActive && !isComplete && "border-border text-muted-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid h-6 w-6 place-content-center rounded-full border text-xs",
                  isComplete && "bg-primary text-primary-foreground",
                  isActive && "border-primary text-primary",
                )}
              >
                {isComplete ? "✓" : item.id}
              </span>
              <span>{item.title}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
