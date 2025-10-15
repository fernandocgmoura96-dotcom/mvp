import { z } from "zod";

export const MAX_MB = 10;
const ALLOWED = ["image/png", "image/svg+xml"] as const;

export const uploadSchema = z
  .custom<File>((f) => !!f, "Selecione um arquivo")
  .refine((f) => ALLOWED.includes((f as File).type), "Formatos aceitos: PNG ou SVG")
  .refine(
    (f) => (f as File).size <= MAX_MB * 1024 * 1024,
    `Tamanho máximo: ${MAX_MB}MB`,
  );

export const variationsSchema = z
  .number()
  .int()
  .min(1, "Escolha pelo menos 1 variação")
  .max(4, "Máximo de 4 variações");
