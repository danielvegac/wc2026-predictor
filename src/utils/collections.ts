// ============================================================
// Generic collection helpers
// ============================================================
// Small, dependency-free utilities that replace patterns repeated
// across the codebase (building lookup maps, descending sorts).

/**
 * Index a list into a `Map` keyed by a derived key.
 * Replaces the repeated `new Map(items.map((x) => [x.key, x]))` pattern.
 */
export function indexBy<T, K>(items: readonly T[], key: (item: T) => K): Map<K, T> {
  return new Map(items.map((item) => [key(item), item]));
}

/**
 * Build a `Map` from a list, deriving both key and value.
 * Replaces `new Map(items.map((x) => [x.key, x.value]))`.
 */
export function toMap<T, K, V>(
  items: readonly T[],
  key: (item: T) => K,
  value: (item: T) => V
): Map<K, V> {
  return new Map(items.map((item) => [key(item), value(item)]));
}

/**
 * Return a new array sorted in descending order by a numeric selector.
 * Does not mutate the input. Replaces `[...items].sort((a, b) => b.x - a.x)`.
 */
export function sortByDesc<T>(items: readonly T[], selector: (item: T) => number): T[] {
  return [...items].sort((a, b) => selector(b) - selector(a));
}
