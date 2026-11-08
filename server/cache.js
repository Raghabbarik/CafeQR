import { Redis } from '@upstash/redis';

// Hybrid Cache: Upstash Redis (if configured in env) + High-Performance In-Memory Fallback
class CacheManager {
  constructor() {
    this.redis = null;
    this.memoryCache = new Map();
    this.isRedisActive = false;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        this.redis = new Redis({ url, token });
        this.isRedisActive = true;
        console.log('⚡ Upstash Redis Cache initialized successfully');
      } catch (err) {
        console.warn('⚠️ Upstash Redis init error, falling back to in-memory cache:', err.message);
      }
    } else {
      console.log('📦 Using In-Memory Cache (Set UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN for global Edge Redis)');
    }
  }

  async get(key) {
    // 1. Try Redis if connected
    if (this.isRedisActive && this.redis) {
      try {
        const val = await this.redis.get(key);
        if (val !== null && val !== undefined) {
          return typeof val === 'string' ? JSON.parse(val) : val;
        }
      } catch (err) {
        console.warn(`Redis get("${key}") error:`, err.message);
      }
    }

    // 2. In-memory fallback
    const entry = this.memoryCache.get(key);
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        return entry.data;
      }
      this.memoryCache.delete(key);
    }
    return null;
  }

  async set(key, data, ttlSeconds = 600) {
    // 1. Write to Redis if active
    if (this.isRedisActive && this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
      } catch (err) {
        console.warn(`Redis set("${key}") error:`, err.message);
      }
    }

    // 2. Write to memory cache for sub-millisecond local reads
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key) {
    if (this.isRedisActive && this.redis) {
      try {
        await this.redis.del(key);
      } catch (err) {
        console.warn(`Redis del("${key}") error:`, err.message);
      }
    }
    this.memoryCache.delete(key);
  }

  async invalidateMenu() {
    await Promise.all([
      this.del('cafeqr:menu'),
      this.del('cafeqr:categories'),
      this.del('cafeqr:cafe'),
    ]);
  }

  async invalidateCafe() {
    await Promise.all([
      this.del('cafeqr:cafe'),
    ]);
  }
}

export const cache = new CacheManager();

