import type { ShirtType } from "./types";

export const SHIRT_TYPES: Record<ShirtType, string> = {
  tshirt: "T-Shirt",
  longline: "Longline",
  regata: "Regata",
};

export const SHIRT_COLORS = [
  { name: "Branco", hex: "#ffffff" },
  { name: "Preto", hex: "#111827" },
  { name: "Vermelho", hex: "#dc2626" },
  { name: "Azul", hex: "#2563eb" },
];

export const colorLabel = (hex: string) => {
  const match = SHIRT_COLORS.find((c) => c.hex === hex);
  return match?.name ?? hex;
};
