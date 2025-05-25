export const currencies = [
  { value: "USD", label: "$ USD", locale: "en-US" },
  { value: "EUR", label: "€ EUR", locale: "en-EU" },
  { value: "GBP", label: "£ GBP", locale: "en-GB" },
  { value: "CAD", label: "$ CAD", locale: "en-CA" },
  { value: "AUD", label: "$ AUD", locale: "en-AU" },
  { value: "JPY", label: "¥ JPY", locale: "ja-JP" },
];

export type Currency = (typeof currencies)[0];
