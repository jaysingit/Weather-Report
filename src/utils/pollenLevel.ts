// Generic pollen-count bands (grains/m³), commonly used for grass/tree
// pollen risk categories. Applied here to the max reading across species,
// so it's a simplification rather than a per-species medical threshold.
export function getPollenLevel(value: number): string {
  if (value < 10) return "Low";
  if (value < 50) return "Moderate";
  if (value < 200) return "High";
  return "Very High";
}
