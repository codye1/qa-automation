import { it, expect } from 'vitest';
import { calcPenalty } from '../src/penalty';

it.each([-1, -30, 2.5, NaN])('відхиляє дні %s', (days) => {
  expect(() => calcPenalty(1000, days)).toThrow('INVALID_DAYS');
});

it.each([0, -100, NaN, Infinity])('відхиляє борг %s', (debt) => {
  expect(() => calcPenalty(debt, 5)).toThrow('INVALID_DEBT');
});

it.each([
  { debt: 1000, days: 0,  expected: 0 },
  { debt: 1000, days: 3,  expected: 0 },
  { debt: 1000, days: 4,  expected: 1 },
  { debt: 2000, days: 4,  expected: 2 },
])('борг $debt, $days дн. → $expected', ({ debt, days, expected }) => {
  expect(calcPenalty(debt, days)).toBeCloseTo(expected, 2);
});