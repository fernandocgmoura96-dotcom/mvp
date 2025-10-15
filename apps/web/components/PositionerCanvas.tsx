"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useDesignStore } from "@/lib/store";
import {
  CANVAS_DIMENSIONS,
  PRINT_AREA,
  disposeCanvas,
  loadArtwork,
  loadShirtMockup,
  registerCanvas,
} from "@/lib/canvas";

export function PositionerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorHex = useDesignStore((state) => state.colorHex);
  const upload = useDesignStore((state) => state.upload);
  const syncTransform = useDesignStore((state) => state.actions.syncTransform);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      selection: false,
    });
    canvas.setDimensions({
      width: CANVAS_DIMENSIONS.width,
      height: CANVAS_DIMENSIONS.height,
    });
    canvasRef.current.width = CANVAS_DIMENSIONS.width;
    canvasRef.current.height = CANVAS_DIMENSIONS.height;
    canvasRef.current.setAttribute("role", "presentation");
    canvasRef.current.setAttribute("aria-hidden", "true");

    registerCanvas(canvas);

    const resize = () => {
      const width = containerRef.current?.offsetWidth ?? CANVAS_DIMENSIONS.width;
      const scale = width / CANVAS_DIMENSIONS.width;
      canvas.setDimensions({
        width,
        height: CANVAS_DIMENSIONS.height * scale,
      });
      canvas.setZoom(scale);
      canvas.requestRenderAll();
    };
    resize();
    window.addEventListener("resize", resize);

    const handleModified = () => {
      syncTransform();
    };
    canvas.on("object:modified", handleModified);
    canvas.on("object:scaling", handleModified);
    canvas.on("object:moving", handleModified);
    canvas.on("object:rotating", handleModified);

    loadShirtMockup(colorHex).catch(console.error);
    if (upload) {
      loadArtwork(upload, useDesignStore.getState().transform).then(() => {
        syncTransform();
      }).catch(console.error);
    }

    return () => {
      window.removeEventListener("resize", resize);
      canvas.dispose();
      disposeCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadShirtMockup(colorHex).catch(console.error);
  }, [colorHex]);

  useEffect(() => {
    if (!upload) return;
    loadArtwork(upload, useDesignStore.getState().transform)
      .then(() => syncTransform())
      .catch(console.error);
  }, [upload, syncTransform]);

  return (
    <div className="w-full" ref={containerRef}>
      <div
        className="relative mx-auto aspect-[3/4] w-full max-w-[min(100%,600px)] overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted"
        aria-hidden
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_DIMENSIONS.width}
          height={CANVAS_DIMENSIONS.height}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[var(--print-top)] h-[var(--print-height)] w-[var(--print-width)] -translate-x-1/2 border-2 border-dashed border-primary/40"
          style={{
            "--print-width": `${(PRINT_AREA.width / CANVAS_DIMENSIONS.width) * 100}%`,
            "--print-height": `${(PRINT_AREA.height / CANVAS_DIMENSIONS.height) * 100}%`,
            "--print-top": `${(PRINT_AREA.top / CANVAS_DIMENSIONS.height) * 100}%`,
          } as CSSProperties & {
            "--print-width": string;
            "--print-height": string;
            "--print-top": string;
          }}
        />
      </div>
    </div>
  );
}
