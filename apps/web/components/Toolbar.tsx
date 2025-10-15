"use client";

import { RotateCw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesignStore } from "@/lib/store";
import { centerArtwork, resetArtwork } from "@/lib/canvas";

export function Toolbar() {
  const upload = useDesignStore((state) => state.upload);
  const syncTransform = useDesignStore((state) => state.actions.syncTransform);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          centerArtwork();
          syncTransform();
        }}
        disabled={!upload}
      >
        <Maximize2 className="h-4 w-4" aria-hidden /> Centralizar
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          resetArtwork();
          syncTransform();
        }}
        disabled={!upload}
      >
        <RotateCw className="h-4 w-4" aria-hidden /> Resetar
      </Button>
    </div>
  );
}
