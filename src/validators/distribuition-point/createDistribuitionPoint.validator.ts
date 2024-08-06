import { z } from "zod";
import { addressSchema } from "../address";

export const distributionPointSchema = z.object({
  name: z.string().min(1, "O campo Nome é obrigatório."),
  phone: z.string().min(1, "O campo Telefone é obrigatório."),
  description: z.string().min(1, "O Descrição Nome é obrigatório."),
  address: addressSchema,
});
