const { client, isReady } = require('../config/redis');

/**
 * Redis-backed cache with in-memory fallback.
 * All values are JSON-serialized.
 */
const store = new Map();

function nowMs() {
  return Date.now();
}

async function get(key) {
  if (isReady()) {
    const raw = await client.get(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAtMs <= nowMs()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

async function set(key, value, ttlMs) {
  if (isReady()) {
    const ttlSec = Math.max(1, Math.floor(ttlMs / 1000));
    await client.setEx(key, ttlSec, JSON.stringify(value));
    return value;
  }
  store.set(key, { value, expiresAtMs: nowMs() + ttlMs });
  return value;
}

async function del(key) {
  if (isReady()) {
    await client.del(key);
    return;
  }
  store.delete(key);
}

async function delPrefix(prefix) {
  if (isReady()) {
    // SCAN to avoid blocking Redis for large keyspaces
    const pattern = `${prefix}*`;
    for await (const keys of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      if (keys.length) await client.del(keys);
    }
    return;
  }
  for (const k of Array.from(store.keys())) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

async function clear() {
  if (isReady()) {
    await client.flushDb();
    return;
  }
  store.clear();
}

async function getOrSet(key, ttlMs, loader) {
  const cached = await get(key);
  if (cached !== undefined) return cached;
  const value = await loader();
  await set(key, value, ttlMs);
  return value;
}

module.exports = { get, set, del, delPrefix, clear, getOrSet };

