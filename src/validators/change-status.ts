import { z } from "zod";

export const changeStatus = z.object({
  status: z.string().min(1, "O campo status é obrigatório."), 
});
