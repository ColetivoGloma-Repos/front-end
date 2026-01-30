import { z } from "zod";
import { UnitType } from "../../../interfaces/products";
import { upsertRequestedProductSchema } from "./upsert-requested-product";

export function upsertDistributionPointSchema(isEditMode: boolean) {
  const base = z.object({
    title: z.string().trim().min(1, "Nome do ponto é obrigatório"),
    phone: z.string().trim().min(1, "Telefone é obrigatório"),
    description: z.string().trim().min(1, "Descrição é obrigatória"),
    address: z.object({
      cep: z
        .string()
        .trim()
        .optional()
        .transform((v) => v ?? ""),
      pais: z.string().trim().min(1, "País é obrigatório"),
      estado: z
        .string()
        .trim()
        .min(2, "UF inválida")
        .max(2, "UF inválida")
        .transform((v) => v.toUpperCase()),
      municipio: z.string().trim().min(1, "Município é obrigatório"),
      bairro: z.string().trim().min(1, "Bairro é obrigatório"),
      logradouro: z.string().trim().min(1, "Logradouro é obrigatório"),
      numero: z.string().trim().min(1, "Número é obrigatório"),
      complemento: z
        .string()
        .trim()
        .optional()
        .transform((v) => v ?? ""),
    }),
    requestedProducts: z.array(upsertRequestedProductSchema(isEditMode)),
  });

  if (isEditMode) {
    return base.extend({
      requestedProducts: base.shape.requestedProducts
        .optional()
        .transform((v) => v ?? []),
    });
  }

  return base.superRefine((val, ctx) => {
    if (!val.requestedProducts || val.requestedProducts.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requestedProducts"],
        message: "Adicione pelo menos 1 produto",
      });
    }
  });
}
