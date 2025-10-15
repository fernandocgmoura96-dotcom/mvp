"use client";

import { fabric } from "fabric";
import { nanoid } from "nanoid";
import type { ExportOptions, TransformState, UploadedAsset } from "./types";
import { applyPreset } from "./presets";

export const CANVAS_DIMENSIONS = { width: 600, height: 780 } as const;
export const PRINT_AREA = {
  width: 320,
  height: 420,
  left: (CANVAS_DIMENSIONS.width - 320) / 2,
  top: 180,
};

let canvasRef: fabric.Canvas | null = null;
let artworkRef: fabric.Object | null = null;
let shirtRef: fabric.Object | null = null;
let printAreaRef: fabric.Rect | null = null;
let detachBounds: (() => void) | null = null;

export const registerCanvas = (canvas: fabric.Canvas) => {
  canvasRef = canvas;
};

export const disposeCanvas = () => {
  detachBounds?.();
  detachBounds = null;
  canvasRef?.dispose();
  canvasRef = null;
  artworkRef = null;
  shirtRef = null;
  printAreaRef = null;
};

export const getCanvas = () => canvasRef;

const ensurePrintArea = () => {
  if (!canvasRef) return;
  if (printAreaRef) {
    canvasRef.remove(printAreaRef);
  }
  printAreaRef = new fabric.Rect({
    left: PRINT_AREA.left,
    top: PRINT_AREA.top,
    width: PRINT_AREA.width,
    height: PRINT_AREA.height,
    strokeDashArray: [6, 6],
    strokeWidth: 1,
    stroke: "rgba(15,23,42,0.35)",
    fill: "rgba(15,23,42,0.05)",
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });
  canvasRef.add(printAreaRef);
  printAreaRef.moveTo(1);
};

export const loadShirtMockup = async (colorHex: string) => {
  if (!canvasRef) return;
  if (shirtRef) {
    canvasRef.remove(shirtRef);
  }
  const url = "/mockups/shirt_base.svg";
  const svgContent = await fetch(url).then((res) => res.text());
  const parsed = await new Promise<fabric.Group>((resolve, reject) => {
    fabric.loadSVGFromString(svgContent, (objects, options) => {
      if (!objects || !objects.length) {
        reject(new Error("SVG inválido"));
        return;
      }
      const group = fabric.util.groupSVGElements(objects, options);
      resolve(group);
    });
  });
  parsed.set({
    left: CANVAS_DIMENSIONS.width / 2,
    top: CANVAS_DIMENSIONS.height / 2,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
    excludeFromExport: false,
    name: "shirt",
  });
  parsed.getObjects().forEach((obj) => {
    if ("fill" in obj && obj.fill && typeof obj.fill === "string") {
      obj.set("fill", colorHex);
    }
  });
  shirtRef = parsed;
  canvasRef.add(parsed);
  parsed.moveTo(0);
  ensurePrintArea();
  canvasRef.requestRenderAll();
};

export const loadArtwork = async (
  asset: UploadedAsset,
  initialTransform?: Partial<TransformState>,
) => {
  if (!canvasRef) return;
  if (artworkRef) {
    detachBounds?.();
    detachBounds = null;
    canvasRef.remove(artworkRef);
  }
  const addObject = async () => {
    if (asset.isSvg) {
      const group = await new Promise<fabric.Group>((resolve, reject) => {
        fabric.loadSVGFromString(asset.dataUrl, (objects, options) => {
          if (!objects || !objects.length) {
            reject(new Error("SVG vazio"));
            return;
          }
          const g = fabric.util.groupSVGElements(objects, options);
          resolve(g);
        });
      });
      return group as fabric.Object;
    }
    return await new Promise<fabric.Object>((resolve, reject) => {
      fabric.Image.fromURL(asset.dataUrl, (img) => {
        if (!img) {
          reject(new Error("Imagem inválida"));
          return;
        }
        resolve(img);
      }, { crossOrigin: "anonymous" });
    });
  };
  const obj = await addObject();
  obj.set({
    name: "artwork",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerColor: "#2563eb",
    borderColor: "#1d4ed8",
    borderDashArray: undefined,
    centeredScaling: true,
    lockUniScaling: false,
  });
  const baseScale = Math.min(
    PRINT_AREA.width / obj.getScaledWidth(),
    PRINT_AREA.height / obj.getScaledHeight(),
  );
  obj.scale(baseScale * 0.8);
  const hasStoredPosition = Boolean(
    initialTransform &&
      (typeof initialTransform.x === "number" || typeof initialTransform.y === "number"),
  );
  const x = hasStoredPosition && typeof initialTransform?.x === "number"
    ? initialTransform.x
    : PRINT_AREA.left + PRINT_AREA.width / 2;
  const y = hasStoredPosition && typeof initialTransform?.y === "number"
    ? initialTransform.y
    : PRINT_AREA.top + PRINT_AREA.height / 2;
  obj.set({ left: x, top: y, originX: "center", originY: "center" });
  if (initialTransform?.scale) {
    obj.scale(initialTransform.scale);
  }
  if (initialTransform?.angle) {
    obj.rotate(initialTransform.angle);
  }
  artworkRef = obj;
  canvasRef.add(obj);
  obj.moveTo(2);
  canvasRef.setActiveObject(obj);
  canvasRef.requestRenderAll();
  if (canvasRef && printAreaRef) {
    attachBoundsHandlers(canvasRef, printAreaRef, obj);
  }
};

export const attachBoundsHandlers = (
  canvas: fabric.Canvas,
  printable: fabric.Rect,
  obj: fabric.Object,
) => {
  detachBounds?.();

  const clampAll = (event?: fabric.IEvent) => {
    if (event?.target && event.target !== obj) return;
    clampRotated(obj, printable, canvas);
  };

  clampRotated(obj, printable, canvas);

  canvas.on("object:moving", clampAll);
  canvas.on("object:scaling", clampAll);
  canvas.on("object:rotating", clampAll);
  obj.on("modified", clampAll);

  detachBounds = () => {
    canvas.off("object:moving", clampAll);
    canvas.off("object:scaling", clampAll);
    canvas.off("object:rotating", clampAll);
    obj.off("modified", clampAll);
  };
};

function clampRotated(obj: fabric.Object, area: fabric.Rect, canvas: fabric.Canvas) {
  const bounds = obj.getBoundingRect(true, true);
  const leftMin = area.left ?? 0;
  const topMin = area.top ?? 0;
  const areaWidth = area.width ?? 0;
  const areaHeight = area.height ?? 0;
  const leftMaxRaw = leftMin + areaWidth - bounds.width;
  const topMaxRaw = topMin + areaHeight - bounds.height;
  const leftMax = leftMaxRaw < leftMin ? leftMin : leftMaxRaw;
  const topMax = topMaxRaw < topMin ? topMin : topMaxRaw;
  const dx = (obj.left ?? 0) - bounds.left;
  const dy = (obj.top ?? 0) - bounds.top;
  const clampedLeft = Math.min(Math.max(bounds.left, leftMin), leftMax);
  const clampedTop = Math.min(Math.max(bounds.top, topMin), topMax);
  obj.set({ left: clampedLeft + dx, top: clampedTop + dy });
  obj.setCoords();
  canvas.requestRenderAll();
}

const clampCurrentArtwork = () => {
  if (canvasRef && printAreaRef && artworkRef) {
    clampRotated(artworkRef, printAreaRef, canvasRef);
  }
};

export const getArtworkTransform = (): TransformState => {
  if (!artworkRef) {
    return { x: PRINT_AREA.left + PRINT_AREA.width / 2, y: PRINT_AREA.top + PRINT_AREA.height / 2, scale: 1, angle: 0 };
  }
  return {
    x: artworkRef.left ?? 0,
    y: artworkRef.top ?? 0,
    scale: artworkRef.scaleX ?? 1,
    angle: artworkRef.angle ?? 0,
  };
};

export const centerArtwork = () => {
  if (!artworkRef) return;
  artworkRef.set({ left: PRINT_AREA.left + PRINT_AREA.width / 2, top: PRINT_AREA.top + PRINT_AREA.height / 2 });
  clampCurrentArtwork();
};

export const resetArtwork = () => {
  if (!artworkRef) return;
  artworkRef.set({
    left: PRINT_AREA.left + PRINT_AREA.width / 2,
    top: PRINT_AREA.top + PRINT_AREA.height / 2,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
  });
  clampCurrentArtwork();
};

export const exportPNG = async (options: ExportOptions) => {
  if (!canvasRef) throw new Error("Canvas não inicializado");
  const prevDimensions = canvasRef.getDimensions();
  const prevZoom = canvasRef.getZoom();
  const prevViewport = canvasRef.viewportTransform
    ? [...canvasRef.viewportTransform]
    : null;
  canvasRef.setDimensions({
    width: CANVAS_DIMENSIONS.width,
    height: CANVAS_DIMENSIONS.height,
  });
  canvasRef.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvasRef.setZoom(1);
  const cleanup = await applyPreset(canvasRef, options);
  const scale = 2;
  const originalWidth = canvasRef.getWidth();
  const originalHeight = canvasRef.getHeight();
  canvasRef.setZoom(scale);
  canvasRef.setWidth(originalWidth * scale);
  canvasRef.setHeight(originalHeight * scale);
  canvasRef.renderAll();
  const dataUrl = canvasRef.toDataURL({ format: "png" });
  cleanup?.();
  canvasRef.setWidth(originalWidth);
  canvasRef.setHeight(originalHeight);
  canvasRef.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvasRef.setZoom(1);
  canvasRef.renderAll();
  if (prevViewport) {
    canvasRef.setViewportTransform(prevViewport);
  }
  canvasRef.setDimensions(prevDimensions);
  canvasRef.setZoom(prevZoom);
  canvasRef.renderAll();
  return dataUrl;
};

export const randomId = () => nanoid();
