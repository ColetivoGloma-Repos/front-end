import { z } from "zod";
import { addressSchema } from "./address.validator";

export const shelterSchema = z.object({
  name: z.string().min(1, "O campo Nome é obrigatório."),
  phone: z.string().min(1, "O campo Telefone é obrigatório."),
  description: z.string().optional(),
  address: addressSchema,
});
