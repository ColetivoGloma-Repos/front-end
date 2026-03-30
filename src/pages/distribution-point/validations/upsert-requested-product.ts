import { z } from "zod";
import { UnitType } from "../../../interfaces/products";

export function upsertRequestedProductSchema(
  isEditMode: boolean,
  disableUnitValidation: boolean = false,
) {
  const base = z.object({
    name: z.string().trim().min(1, "Nome do produto é obrigatório"),
    requestedQuantity: z.coerce
      .number({
        invalid_type_error: "Qtd deve ser um número",
        required_error: "Qtd é obrigatória",
      })
      .int("Qtd deve ser um número inteiro")
      .positive("Qtd deve ser maior que zero"),
    unit: disableUnitValidation
      ? z.any().optional()
      : z.nativeEnum(UnitType, {
          required_error: "Unidade é obrigatória",
          invalid_type_error: "Unidade inválida",
        }),
  });

  if (isEditMode) {
    return base.partial();
  }

  return base;
}
