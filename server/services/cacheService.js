class CacheService {
  constructor(defaultTtlMs = 120000, maxEntries = 200) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxEntries = maxEntries;
    this.store = new Map();
    this.stats = { hits: 0, misses: 0, tokensSaved: 0 };
  }
  //check if the answer is already cached
  get(key) {
    const item = this.store.get(key);
    //not in cache
    if (!item) {
      this.stats.misses++;
      return null;
    }
    //expired 
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }
    //valid cache hit
    this.stats.hits++;
    if (item.tokens) {
      this.stats.tokensSaved += item.tokens;
    }
    return item.value;
  }
  //save an AI response into memory 
  set(key, value, tokens = 0, ttlMs = this.defaultTtlMs) {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      tokens,
      expiry: Date.now() + ttlMs,
      cachedAt: new Date().toISOString()
    });
  }
  //returns metric for the admin Dashboard
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? Math.round((this.stats.hits / total) * 100) : 0;
    return {
      ...this.stats,
      totalQueries: total,
      hitRatePercent: hitRate,
      activeEntries: this.store.size
    };
  }

  clear() {
    this.store.clear();
  }
}

const cacheService = new CacheService();

module.exports = { CacheService, cacheService };
