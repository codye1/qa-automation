import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  type OrderItem,
  validateCoupon,
} from '../src/order';

const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});

describe('calcSubtotal', () => {

  it('підсумовує вартість позицій з урахуванням кількості', () => {
    // Arrange
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];

    // Act
    const result = calcSubtotal(items);

    // Assert
    expect(result).toBe(350);
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item(-1)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {

  it.each([
    { tier: 'basic' as const,  subtotal: 500,  expected: 0 },
    { tier: 'silver' as const, subtotal: 500,  expected: 0.05 },
    { tier: 'gold' as const,   subtotal: 500,  expected: 0.1 },
    { tier: 'basic' as const,  subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const,   subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('межа великого замовлення: $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });

  it('обмежує сумарну знижку максимальним значенням', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });

  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1))
      .toThrow('INVALID_PROMO');
  });
});


describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → доставка %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});

describe('calcOrderTotal', () => {

  it('додає доставку до замовлення нижче порога', () => {
    const total = calcOrderTotal([item(500)], 'basic');
    expect(total).toBeCloseTo(560, 2);
  });

  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    // 1200 − 10 % = 1080 ≥ 1000, доставка безкоштовна
    const total = calcOrderTotal([item(1200)], 'gold');
    expect(total).toBeCloseTo(1080, 2);
  });

  it('знижка може опустити суму нижче порога доставки', () => {
    // 1050 − 10 % = 945 < 1000, тому доставка платна
    const total = calcOrderTotal([item(1050)], 'gold');
    expect(total).toBeCloseTo(1005, 2);
  });

  it('передає виняток із нижнього рівня', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('validateCoupon', () => {

  it('приймає код у правильному форматі', () => {
    expect(validateCoupon('ABC-1234')).toBe(true);
  });

  it.each([
    { code: 'AB-1234',   expected: false, case: '2 літери (межа − 1)' },
    { code: 'ABC-1234',  expected: true,  case: '3 літери (межа)' },
    { code: 'ABCD-1234', expected: false, case: '4 літери (межа + 1)' },
  ])('кількість літер: $case → $expected', ({ code, expected }) => {
    expect(validateCoupon(code)).toBe(expected);
  });

  it.each([
    { code: 'ABC-123',   expected: false, case: '3 цифри (межа − 1)' },
    { code: 'ABC-1234',  expected: true,  case: '4 цифри (межа)' },
    { code: 'ABC-12345', expected: false, case: '5 цифр (межа + 1)' },
  ])('кількість цифр: $case → $expected', ({ code, expected }) => {
    expect(validateCoupon(code)).toBe(expected);
  });

  it.each([
    ['abc-1234'],
    ['AbC-1234'],
    ['ABC_1234'],
    ['ABC1234'],
    ['ABC-12A4'],
    ['АВС-1234'],        // кириличні літери А, В, С
    [' ABC-1234'],
    ['ABC-1234 '],
    ['ABC-1234\n'],
    [''],
  ])('відхиляє некоректний формат %j', (code) => {
    expect(validateCoupon(code)).toBe(false);
  });

  it.each([
    [null],
    [undefined],
    [1234],
    [{}],
  ])('кидає INVALID_COUPON_TYPE, якщо аргумент не рядок: %j', (value) => {
    expect(() => validateCoupon(value as unknown as string))
      .toThrow('INVALID_COUPON_TYPE');
  });
});