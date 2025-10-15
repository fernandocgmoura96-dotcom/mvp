import { z } from "zod";

export const uploadSchema = z.object({
  name: z.string().min(1, "Nome inválido"),
  size: z.number().max(10 * 1024 * 1024, "Arquivo deve ter no máximo 10MB"),
  type: z.string().regex(/image\/(png|svg\+xml)/, "Formato suportado: PNG ou SVG"),
});

export const variationsSchema = z
  .number()
  .int()
  .min(1, "Escolha pelo menos 1 variação")
  .max(4, "Máximo de 4 variações");
