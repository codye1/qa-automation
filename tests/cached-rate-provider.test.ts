import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CachedRateProvider } from '../src/cached-rate-provider';
import type { RateProvider } from '../src/order-service';
import { InMemoryRateCache } from './fakes/in-memory-rate-cache';

describe('CachedRateProvider', () => {
  let source: RateProvider;
  let cache: InMemoryRateCache;
  let provider: CachedRateProvider;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T10:00:00.000Z'));
    source = { getRate: vi.fn().mockResolvedValue(41.25) };
    cache = new InMemoryRateCache();
    provider = new CachedRateProvider(source, cache);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // перевірка СТАНУ (підробка)
  it('зберігає отриманий курс у кеші', async () => {
    await provider.getRate('USD', 'UAH');

    expect(cache.size).toBe(1);
    expect(cache.get('USD->UAH')?.rate).toBe(41.25);
  });

  // перевірка ВЗАЄМОДІЇ (шпигун)
  it('другий виклик у межах 60 с не звертається до джерела', async () => {
    await provider.getRate('USD', 'UAH');
    vi.advanceTimersByTime(59_999);
    await provider.getRate('USD', 'UAH');

    expect(source.getRate).toHaveBeenCalledTimes(1);
  });

  it('через 60 с робить новий запит', async () => {
    await provider.getRate('USD', 'UAH');
    vi.advanceTimersByTime(60_000);
    await provider.getRate('USD', 'UAH');

    expect(source.getRate).toHaveBeenCalledTimes(2);
  });

  // відмова 1: джерело недоступне
  it('відмова джерела: помилка пробрасується, кеш порожній', async () => {
    source.getRate = vi.fn().mockRejectedValue(new Error('RATE_UNAVAILABLE'));
    provider = new CachedRateProvider(source, cache);

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE');
    expect(cache.size).toBe(0);
  });

  // відмова 2: джерело падає після спливу кешу
  it('відмова після спливу кешу: застарілий курс не повертається', async () => {
    source.getRate = vi.fn()
      .mockResolvedValueOnce(41)
      .mockRejectedValueOnce(new Error('RATE_UNAVAILABLE'));
    provider = new CachedRateProvider(source, cache);

    await provider.getRate('USD', 'UAH');
    vi.advanceTimersByTime(60_000);

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE');
  });
});