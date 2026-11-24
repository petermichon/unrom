// Rotation for checks that must eventually touch every item but cannot afford
// to touch them all at once. Successive rotations tile the list exactly, so a
// daily caller covers everything within `ceil(items / size)` runs and re-probes
// the same window if it runs twice in one rotation.

export function windowsFor(total: number, size: number): number {
  if (total === 0 || size <= 0) return 0;
  return Math.ceil(total / size);
}

export function sampleWindow<T>(
  items: T[],
  size: number,
  rotation: number,
): T[] {
  if (items.length === 0 || size <= 0) return [];
  if (size >= items.length) return items.slice();
  const windows = windowsFor(items.length, size);
  const index = ((rotation % windows) + windows) % windows;
  return items.slice(index * size, index * size + size);
}
