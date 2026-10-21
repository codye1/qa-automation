import { describe, it, expect } from 'vitest';
import { secondsToTimeString } from '../src/time-format';

describe('secondsToTimeString', () => {
  // коректні дані
  it('повертає 01:01:01 для 3661 секунди', () => {
    // Arrange
    const totalSeconds = 3661;

    // Act
    const result = secondsToTimeString(totalSeconds);

    // Assert
    expect(result).toBe('01:01:01');
  });

  it('повертає 00:01:30 для 90 секунд', () => {
    expect(secondsToTimeString(90)).toBe('00:01:30');
  });

  // 	межове значення

  it('повертає 00:00:00 для нуля секунд', () => {
    expect(secondsToTimeString(0)).toBe('00:00:00');
  });

  // 	некоректні дані з винятком

  it('відхиляє від’ємну кількість секунд', () => {
    expect(() => secondsToTimeString(-1)).toThrow('INVALID_SECONDS');
  });

  it('строка', () => {
    expect(() => secondsToTimeString("33")).toThrow('INVALID_SECONDS');
  });
});