"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  ModelId,
  ResultAsset,
  ShirtType,
  TransformState,
  UploadedAsset,
} from "./types";
import { exportPNG, getArtworkTransform, randomId, PRINT_AREA } from "./canvas";
import { variationsSchema } from "./validators";

const DEFAULT_TRANSFORM: TransformState = {
  x: PRINT_AREA.left + PRINT_AREA.width / 2,
  y: PRINT_AREA.top + PRINT_AREA.height / 2,
  scale: 1,
  angle: 0,
};

export interface DesignState {
  step: 1 | 2 | 3 | 4;
  shirtType: ShirtType;
  colorHex: string;
  upload?: UploadedAsset;
  transform: TransformState;
  model: ModelId;
  variations: number;
  results: ResultAsset[];
  isGenerating: boolean;
  actions: {
    setStep(n: 1 | 2 | 3 | 4): void;
    setProduct(t: ShirtType, colorHex: string): void;
    setUpload(upload?: UploadedAsset): void;
    setTransform(transform: TransformState): void;
    setModel(model: ModelId): void;
    setVariations(n: number): void;
    generateResults(): Promise<void>;
    reset(): void;
    syncTransform(): void;
  };
}

export const useDesignStore = create<DesignState>()(
  immer((set, get) => ({
    step: 1,
    shirtType: "tshirt",
    colorHex: "#ffffff",
    transform: DEFAULT_TRANSFORM,
    model: "gemini15flash_sim",
    variations: 2,
    results: [],
    isGenerating: false,
    actions: {
      setStep: (n) => set((state) => {
        state.step = n;
      }),
      setProduct: (t, colorHex) =>
        set((state) => {
          state.shirtType = t;
          state.colorHex = colorHex;
        }),
      setUpload: (upload) =>
        set((state) => {
          state.upload = upload;
        }),
      setTransform: (transform) =>
        set((state) => {
          state.transform = transform;
        }),
      setModel: (model) =>
        set((state) => {
          state.model = model;
        }),
      setVariations: (n) => {
        const parsed = variationsSchema.safeParse(n);
        set((state) => {
          state.variations = parsed.success
            ? parsed.data
            : Math.min(4, Math.max(1, n));
        });
      },
      generateResults: async () => {
        const { variations, model } = get();
        if (get().isGenerating) return;
        set((state) => {
          state.isGenerating = true;
        });
        try {
          const results: ResultAsset[] = [];
          for (let i = 0; i < variations; i += 1) {
            const dataUrl = await exportPNG({ preset: model, variationIndex: i });
            results.push({ id: randomId(), dataUrl });
          }
          set((state) => {
            state.results = results;
          });
        } finally {
          set((state) => {
            state.isGenerating = false;
          });
        }
      },
      reset: () =>
        set((state) => {
          state.step = 1;
          state.shirtType = "tshirt";
          state.colorHex = "#ffffff";
          state.upload = undefined;
          state.transform = DEFAULT_TRANSFORM;
          state.model = "gemini15flash_sim";
          state.variations = 2;
          state.results = [];
          state.isGenerating = false;
        }),
      syncTransform: () => {
        const transform = getArtworkTransform();
        set((state) => {
          state.transform = transform;
        });
      },
    },
  })),
);
