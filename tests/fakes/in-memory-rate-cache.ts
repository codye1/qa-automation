import type { RateCache, CacheEntry } from '../../src/cached-rate-provider';

export class InMemoryRateCache implements RateCache {
  private items = new Map<string, CacheEntry>();

  get(key: string) { return this.items.get(key); }
  set(key: string, entry: CacheEntry) { this.items.set(key, entry); }
  get size() { return this.items.size; }
}