// The Intl.NumberFormat is built inside format() rather than once at module
// load: Stryker's vitest runner does not reliably re-evaluate module-level
// ("static") mutants, which let mutations of these literals survive on CI.
export const formatter = {
  format: (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value),
};
