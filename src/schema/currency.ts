import { z } from "zod";

export const currencySchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  rate: z.number(),
});

export type Currency = z.infer<typeof currencySchema>;

export const DEFAULT_CURRENCY = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  rate: 1,
} as const;
