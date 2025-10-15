export type ShirtType = "tshirt" | "longline" | "regata";

export type ModelId = "gemini15flash_sim" | "sdxl_sim";

export interface UploadedAsset {
  name: string;
  dataUrl: string;
  isSvg: boolean;
}

export interface TransformState {
  x: number;
  y: number;
  scale: number;
  angle: number;
}

export interface ResultAsset {
  id: string;
  dataUrl: string;
}

export interface ExportOptions {
  preset: ModelId;
  variationIndex: number;
}
