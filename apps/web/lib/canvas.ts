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

export const registerCanvas = (canvas: fabric.Canvas) => {
  canvasRef = canvas;
};

export const disposeCanvas = () => {
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
  attachGuards(obj);
};

const attachGuards = (obj: fabric.Object) => {
  if (!canvasRef) return;
  const clamp = () => {
    if (!canvasRef || !artworkRef) return;
    const bounding = obj.getBoundingRect(true, true);
    const maxLeft = PRINT_AREA.left + PRINT_AREA.width;
    const maxTop = PRINT_AREA.top + PRINT_AREA.height;
    const minLeft = PRINT_AREA.left;
    const minTop = PRINT_AREA.top;
    if (bounding.left < minLeft) {
      obj.set({ left: minLeft + bounding.width / 2 });
    }
    if (bounding.top < minTop) {
      obj.set({ top: minTop + bounding.height / 2 });
    }
    if (bounding.left + bounding.width > maxLeft) {
      obj.set({ left: maxLeft - bounding.width / 2 });
    }
    if (bounding.top + bounding.height > maxTop) {
      obj.set({ top: maxTop - bounding.height / 2 });
    }
  };
  const handleModified = () => {
    clamp();
    canvasRef?.requestRenderAll();
  };
  obj.on("moving", clamp);
  obj.on("scaling", clamp);
  obj.on("rotating", () => canvasRef?.requestRenderAll());
  obj.on("modified", handleModified);
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
  canvasRef?.requestRenderAll();
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
  canvasRef?.requestRenderAll();
};

export const exportPNG = async (options: ExportOptions) => {
  if (!canvasRef) throw new Error("Canvas não inicializado");
  const prevDimensions = canvasRef.getDimensions();
  const prevZoom = canvasRef.getZoom();
  canvasRef.setDimensions({
    width: CANVAS_DIMENSIONS.width,
    height: CANVAS_DIMENSIONS.height,
  });
  canvasRef.setZoom(1);
  const cleanup = await applyPreset(canvasRef, options);
  const dataUrl = canvasRef.toDataURL({ format: "png", enableRetinaScaling: true });
  cleanup?.();
  canvasRef.setDimensions(prevDimensions);
  canvasRef.setZoom(prevZoom);
  return dataUrl;
};

export const randomId = () => nanoid();
