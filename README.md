# two-sum-expansion-lib

Adds two floating-point numbers exactly and returns the result split into high and low compensation parts, using Dekker's two-sum algorithm.

## Usage

```js
import { twoSum } from "two-sum-expansion-lib";

// Returns [hi, lo] where hi + lo exactly equals a + b.
const [hi, lo] = twoSum(1.0, 2.0);
// hi === 3.0, lo === 0.0

// The low part captures round-off error from adding numbers of differing magnitude.
const [hi2, lo2] = twoSum(1.0, 1e-20);
// hi2 + lo2 === 1.0 + 1e-20, even though hi2 rounds to 1.0.
```

## Why this exists

Standard IEEE 754 doubles carry 53 bits of precision, so the exact sum of two doubles can require up to 54 bits and cannot always be stored in a single double. Dekker's two-sum algorithm recovers the round-off error by exploiting the fact that `a + b` in hardware rounds to the nearest representable value, leaving a residual that can be reconstructed as `(a - (a + b)) + b` — a residual that is itself exact thanks to the Sterbenz lemma.

The trade-off: each call costs four floating-point ops to produce two results. You pay that cost when you need to accumulate across many additions without drift — for example in compensated summation or Shewchuk-style exact arithmetic — and you should not pay it for sums where a single ulp of error is tolerable.

## Edge cases

The algorithm assumes the floating-point environment rounds to nearest-even, the IEEE 754 default. If you have changed the rounding mode (via `fesetround` through a native binding), the residual reconstruction will be wrong. The library does not check the rounding mode; that is a global runtime property that would be expensive to verify per call.

`NaN` propagates: either `NaN` input yields `NaN` in the high part and `NaN` in the low part. This is the behavior of the underlying IEEE 754 arithmetic and is deliberately not special-cased.

Subnormal inputs work correctly because the algorithm uses only addition and subtraction, both of which are exact-or-rounding operations on subnormals.

## Exports

- `twoSum(a, b)` — returns `[hi, lo]`, a two-element array of numbers. `hi` is the rounded sum, `lo` is the compensation such that `hi + lo` exactly equals `a + b`.
