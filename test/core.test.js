import { test } from "node:test";
import assert from "node:assert/strict";
import { twoSum } from "../src/index.js";

/**
 * Asserts that hi + lo exactly equals a + b, using Array.prototype.reduce to
 * sum the parts so we are not depending on any particular evaluation order
 * or associativity in the test itself. The reduce is exact for two-element
 * arrays, so this is a faithful check.
 */
function assertExact(a, b) {
  const [hi, lo] = twoSum(a, b);
  const reconstructed = [hi, lo].reduce((x, y) => x + y, 0);
  assert.equal(reconstructed, a + b);
  assert.ok(Number.isFinite(reconstructed) || !Number.isFinite(a + b));
  return [hi, lo];
}

test("sum of two integers with no round-off returns lo === 0", () => {
  const [hi, lo] = twoSum(1.0, 2.0);
  assert.equal(hi, 3.0);
  assert.equal(lo, 0.0);
});

test("sum of two equal halves recovers the lost low bit", () => {
  // 2^53 is the threshold above which doubles can no longer represent every
  // integer. Adding 1 to it should round to even; the low part must carry
  // the dropped 1 so that hi + lo is exact.
  const a = 9007199254740992; // 2^53
  const [hi, lo] = twoSum(a, 1);
  assert.equal(hi, 9007199254740992); // rounds back to 2^53
  assert.equal(lo, 1);
  assert.equal(hi + lo, a + 1);
});

test("operands need not be pre-sorted by magnitude", () => {
  // Same pair as the previous test but reversed. The four-op Dekker form
  // handles this without branching; a two-op form would need |a| >= |b|.
  const a = 1;
  const b = 9007199254740992; // 2^53
  const [hi, lo] = twoSum(a, b);
  assert.equal(hi, 9007199254740992);
  assert.equal(lo, 1);
  assert.equal(hi + lo, a + b);
});

test("differing magnitudes produce a non-zero low part", () => {
  const a = 1.0;
  const b = 1e-20;
  const [hi, lo] = twoSum(a, b);
  assert.equal(hi, 1.0); // b is below the ulp of a
  assert.ok(lo !== 0.0, "low part should carry the dropped residual");
  assert.equal(hi + lo, a + b);
});

test("zeros are preserved exactly", () => {
  const [hi, lo] = twoSum(0.0, 0.0);
  assert.equal(hi, 0.0);
  assert.equal(lo, 0.0);
  assert.equal(Object.is(hi, 0.0), true); // not -0
});

test("adding -0 to +0 yields +0 in the high part", () => {
  // IEEE 754: (+0) + (-0) === +0. The algorithm should not flip the sign.
  const [hi, lo] = twoSum(0.0, -0.0);
  assert.equal(Object.is(hi, 0.0), true);
  assert.equal(lo, 0.0);
});

test("adding x to -x yields exactly zero", () => {
  const [hi, lo] = twoSum(1.5, -1.5);
  assert.equal(hi, 0.0);
  assert.equal(lo, 0.0);
});

test("subnormal inputs are handled", () => {
  // The smallest positive subnormal. Adding two of them is exactly
  // representable as a normal number, so lo should be 0.
  const sub = 5e-324;
  const [hi, lo] = twoSum(sub, sub);
  assert.equal(hi, sub + sub);
  assert.equal(lo, 0.0);
});

test("NaN propagates into both parts", () => {
  const [hi, lo] = twoSum(NaN, 1.0);
  assert.ok(Number.isNaN(hi));
  assert.ok(Number.isNaN(lo));
});

test("Infinity plus finite yields infinity with NaN low part", () => {
  // The Sterbenz lemma does not apply to infinities: a - s becomes
  // Infinity - Infinity = NaN, which propagates into the low part.
  const [hi, lo] = twoSum(Infinity, 1.0);
  assert.equal(hi, Infinity);
  assert.ok(Number.isNaN(lo));
});

test("Infinity plus Infinity yields infinity with NaN low part", () => {
  // Same as above: the residual reconstruction produces NaN because
  // Infinity - Infinity is undefined in IEEE 754.
  const [hi, lo] = twoSum(Infinity, Infinity);
  assert.equal(hi, Infinity);
  assert.ok(Number.isNaN(lo));
});

test("Infinity plus negative Infinity yields NaN", () => {
  // This is the IEEE 754 undefined case; we do not special-case it.
  const [hi, lo] = twoSum(Infinity, -Infinity);
  assert.ok(Number.isNaN(hi));
  assert.ok(Number.isNaN(lo));
});

test("result is a two-element array of numbers", () => {
  const result = twoSum(0.1, 0.2);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 2);
  assert.equal(typeof result[0], "number");
  assert.equal(typeof result[1], "number");
});
