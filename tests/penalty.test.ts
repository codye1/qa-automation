import { it, expect } from 'vitest';
import { calcPenalty } from '../src/penalty';

it.each([-1, -30, 2.5, NaN])('відхиляє дні %s', (days) => {
  expect(() => calcPenalty(1000, days)).toThrow('INVALID_DAYS');
});

it.each([0, -100, NaN, Infinity])('відхиляє борг %s', (debt) => {
  expect(() => calcPenalty(debt, 5)).toThrow('INVALID_DEBT');
});