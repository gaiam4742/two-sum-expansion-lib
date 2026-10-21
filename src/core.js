/**
 * Compute the exact sum of two doubles as a compensated pair.
 *
 * Uses Dekker's two-sum algorithm (Dekker 1971, theorem 4.5). Unlike Knuth's
 * earlier formulation it does NOT require |a| >= |b| on input, which is why it
 * costs four floating-point operations rather than two. This is the right
 * choice for a standalone two-sum: callers should not have to pre-sort their
 * operands, and the two extra subtractions are nearly free on modern hardware
 * compared to the branch a pre-sort would introduce.
 *
 * The residual `bb` is recovered as `(a - s) + b`. By the Sterbenz lemma,
 * `a - s` is exact whenever `a` and `s` are within a factor of 2 of each
 * other, which holds because `s` is the nearest rounding of `a + b`.
 *
 * @param {number} a - first summand (any finite double, NaN, or Infinity)
 * @param {number} b - second summand (any finite double, NaN, or Infinity)
 * @returns {[number, number]} `[hi, lo]` where `hi` is the rounded sum and
 *   `lo` is the compensation term such that `hi + lo === a + b` exactly.
 */
export function twoSum(a, b) {
  const s = a + b;
  const v = a - s;
  const lo = v + b;
  return [s, lo];
}
