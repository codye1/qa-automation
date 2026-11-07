import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw/http';
import { server, RATE_URL } from './msw/server';
import { HttpRateProvider } from '../src/rate-provider';
import { CachedRateProvider } from '../src/cached-rate-provider';
import { InMemoryRateCache } from './fakes/in-memory-rate-cache';

describe('CachedRateProvider через HTTP (MSW)', () => {
  let provider: CachedRateProvider;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });   // фальшивий лише час, мережа працює
    vi.setSystemTime(new Date('2026-03-15T10:00:00.000Z'));
    provider = new CachedRateProvider(
      new HttpRateProvider('https://api.example.com'),
      new InMemoryRateCache(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('успіх: повертає курс, а другий виклик не робить запиту', async () => {
    let requests = 0;
    server.use(
      http.get(RATE_URL, () => {
        requests++;
        return HttpResponse.json({ rate: 41.25 });
      }),
    );

    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);
    await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);

    expect(requests).toBe(1);
  });

  it('помилковий статус 503: відхиляє з RATE_UNAVAILABLE', async () => {
    server.use(
      http.get(RATE_URL, () => new HttpResponse(null, { status: 503 })),
    );

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE');
  });

  it('некоректний формат (рядок замість числа): відхиляє з INVALID_RATE_FORMAT', async () => {
    server.use(
      http.get(RATE_URL, () => HttpResponse.json({ rate: '41.25' })),
    );

    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('INVALID_RATE_FORMAT');
  });
});