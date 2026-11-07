import type { RateProvider } from './order-service';

export interface CacheEntry {
  rate: number;
  fetchedAt: number;
}

export interface RateCache {
  get(key: string): CacheEntry | undefined;
  set(key: string, entry: CacheEntry): void;
}

export class CachedRateProvider implements RateProvider {
  constructor(
    private source: RateProvider,
    private cache: RateCache,
    private ttlMs = 60_000,
  ) {}

  async getRate(from: string, to: string): Promise<number> {
    const key = `${from}->${to}`;
    const now = Date.now();

    const hit = this.cache.get(key);
    if (hit && now - hit.fetchedAt < this.ttlMs) return hit.rate;

    const rate = await this.source.getRate(from, to);
    this.cache.set(key, { rate, fetchedAt: now });
    return rate;
  }
}