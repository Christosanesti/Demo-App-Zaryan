import { z } from "zod";

export const DEFAULT_CURRENCY = "USD";

export const CurrencySchema = z.object({
  currency: z.literal(DEFAULT_CURRENCY),
});

export type CurrencySchemaType = z.infer<typeof CurrencySchema>;
