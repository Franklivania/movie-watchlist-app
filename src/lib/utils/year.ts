/**
 * Returns a year decremented from the current year.
 *
 * @example
 * getDecrementedYear() // -> currentYear - 1
 * getDecrementedYear(0) // -> currentYear
 * getDecrementedYear(2) // -> currentYear - 2
 */
export function getDecrementedYear(decrementBy: number = 1, from: Date = new Date()): number {
  const currentYear = from.getFullYear();
  const safeDecrement = Number.isFinite(decrementBy) ? Math.trunc(decrementBy) : 1;
  return currentYear - safeDecrement;
}


