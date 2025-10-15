"use client";

import { fabric } from "fabric";
import type { ExportOptions, ModelId } from "./types";

const PRESETS = [
  { id: "gemini15flash_sim" as const, label: "gemini-1.5-flash (simulado)" },
  { id: "sdxl_sim" as const, label: "sdxl (simulado)" },
] as const;

const NOISE_CACHE: Record<number, string> = {};

const createNoiseDataUrl = (variationIndex: number) => {
  if (NOISE_CACHE[variationIndex]) return NOISE_CACHE[variationIndex];
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = Math.floor(Math.random() * 40);
    imageData.data[i] = 220 + n;
    imageData.data[i + 1] = 220 + n;
    imageData.data[i + 2] = 220 + n;
    imageData.data[i + 3] = 25;
  }
  ctx.putImageData(imageData, 0, 0);
  NOISE_CACHE[variationIndex] = canvas.toDataURL();
  return NOISE_CACHE[variationIndex];
};

const gradientByVariation = (index: number) => {
  const gradients = [
    ["#f6f1ff", "#e7f9ff"],
    ["#fff7ed", "#fce7f3"],
    ["#f0f9ff", "#ede9fe"],
    ["#fef3c7", "#e0f2fe"],
  ];
  return gradients[index % gradients.length];
};

type Cleanup = () => void;

export const applyPreset = async (
  canvas: fabric.Canvas,
  options: ExportOptions,
): Promise<Cleanup | undefined> => {
  const { preset, variationIndex } = options;
  const originalBackground = canvas.backgroundColor;
  const overlays: fabric.Object[] = [];
  const shirt = canvas
    .getObjects()
    .find((obj) => "name" in obj && obj.name === "shirt");
  const originalShadow = shirt?.shadow;

  const cleanup = () => {
    overlays.forEach((overlay) => canvas.remove(overlay));
    if (shirt && originalShadow) {
      shirt.set("shadow", originalShadow);
    } else if (shirt) {
      shirt.set("shadow", undefined);
    }
    canvas.setBackgroundColor(originalBackground ?? undefined, () => undefined);
    canvas.requestRenderAll();
  };

  if (preset === "gemini15flash_sim") {
    canvas.setBackgroundColor("#f8f8f6", () => undefined);
    if (shirt) {
      shirt.set("shadow", {
        color: "rgba(15,23,42,0.22)",
        blur: 35,
        offsetX: 0,
        offsetY: 26,
      });
    }
    canvas.requestRenderAll();
    return cleanup;
  }

  if (preset === "sdxl_sim") {
    const [from, to] = gradientByVariation(variationIndex);
    const gradientRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      selectable: false,
      evented: false,
      excludeFromExport: false,
      fill: new fabric.Gradient({
        type: "linear",
        gradientUnits: "percentage",
        coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
        colorStops: [
          { offset: 0, color: from },
          { offset: 1, color: to },
        ],
      }),
    });
    canvas.add(gradientRect);
    overlays.push(gradientRect);
    gradientRect.sendToBack();

    const noiseUrl = createNoiseDataUrl(variationIndex + 1);
    if (noiseUrl) {
      await new Promise<void>((resolve) => {
        fabric.Image.fromURL(noiseUrl, (img) => {
          if (!img) return resolve();
          img.set({
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
            excludeFromExport: false,
            globalCompositeOperation: "soft-light",
            opacity: 0.25,
          });
          img.scaleToWidth(canvas.getWidth());
          img.scaleToHeight(canvas.getHeight());
          canvas.add(img);
          img.moveTo(1);
          overlays.push(img);
          resolve();
        });
      });
    }

    if (shirt) {
      shirt.set("shadow", {
        color: "rgba(15,23,42,0.18)",
        blur: 25,
        offsetX: 0,
        offsetY: 18,
      });
    }

    canvas.requestRenderAll();
    return cleanup;
  }

  return cleanup;
};

export const listPresets = () => PRESETS.map((preset) => ({ ...preset }));

export const modelLabel = (model: ModelId) =>
  PRESETS.find((preset) => preset.id === model)?.label ?? model;
