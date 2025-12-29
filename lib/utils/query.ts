export function parseNumber(value?: string | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function parseCities(value?: string | null) {
  if (!value) return null;
  const cities = value
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  return cities.length ? cities : null;
}