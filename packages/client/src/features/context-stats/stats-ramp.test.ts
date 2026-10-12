import { expect, test } from 'vitest'
import { CACHE_HIT_STOPS, CONTEXT_STOPS, RAMP_SPAN_HIGH, RAMP_SPAN_LOW, rampPosition } from './stats-ramp'

/**
 * The colour band a reading falls in (D27): the segment and the position inside
 * it are what the browser mixes the colour from, so the boundary behaviour is
 * what a test can hold — a reading on a stop belongs to that stop, and the two
 * ends saturate instead of running off the band.
 */

test('a reading below the first stop saturates at the low end', () => {
  expect(rampPosition(89.9, CACHE_HIT_STOPS)).toEqual({ span: RAMP_SPAN_LOW, mix: '0%' })
})

test('a reading on a stop belongs to the segment that stop opens', () => {
  // 92 is the second stop: inside the segment that runs from orange to yellow.
  expect(rampPosition(92, CACHE_HIT_STOPS)).toEqual({ span: '1', mix: '0%' })
})

test('a reading inside a segment lands part way along it, to a tenth of a percent', () => {
  // Halfway from 90 to 92.
  expect(rampPosition(91, CACHE_HIT_STOPS)).toEqual({ span: '0', mix: '50%' })
  // A reading that does not divide evenly keeps one decimal.
  expect(rampPosition(91.334, CACHE_HIT_STOPS)).toEqual({ span: '0', mix: '66.7%' })
})

test('a reading at or past the last stop saturates at the high end', () => {
  expect(rampPosition(99, CACHE_HIT_STOPS)).toEqual({ span: RAMP_SPAN_HIGH, mix: '0%' })
  expect(rampPosition(100, CACHE_HIT_STOPS)).toEqual({ span: RAMP_SPAN_HIGH, mix: '0%' })
})

test.each([
  [0, RAMP_SPAN_LOW, '0%'],
  [30, RAMP_SPAN_LOW, '0%'],
  [49.9, RAMP_SPAN_LOW, '0%'],
  [50, '0', '0%'],
  [55, '0', '50%'],
  [60, '1', '0%'],
  [70, '2', '0%'],
  [75, '2', '50%'],
  [80, '3', '0%'],
  [82.5, '3', '50%'],
  [85, '4', '0%'],
  [87.333, '4', '46.7%'],
  [88.75, '4', '75%'],
  [90, RAMP_SPAN_HIGH, '0%'],
  [100, RAMP_SPAN_HIGH, '0%'],
  [110, RAMP_SPAN_HIGH, '0%'],
] as const)('context occupancy %s%% takes span %s at %s', (value, span, mix) => {
  expect(rampPosition(value, CONTEXT_STOPS)).toEqual({ span, mix })
})
