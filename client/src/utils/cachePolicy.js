/**
 * Default time-to-live for session-scoped cache entries (15 minutes).
 */
export const CACHE_TTL_MS = 15 * 60 * 1000;

const VERSION = 1;

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => sortValue(entry));
  }

  if (value && typeof value === 'object') {
    const sorted = {};
    Object.keys(value)
      .sort()
      .forEach((key) => {
        sorted[key] = sortValue(value[key]);
      });
    return sorted;
  }

  return value;
}

/**
 * Canonicalize an object into a stable JSON string usable for hashing.
 * @param {unknown} obj
 * @returns {string}
 */
export function canonical(obj) {
  const prepared = sortValue(obj);
  try {
    return JSON.stringify(prepared);
  } catch (error) {
    return 'null';
  }
}

/**
 * Lightweight non-cryptographic hash for staleness checks.
 * @param {string} str
 * @returns {string}
 */
export function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // Convert to 32bit integer
  }
  return `h${h >>> 0}`;
}

/**
 * Wrap payload with metadata used for staleness detection.
 * @template T
 * @param {T} payload
 * @returns {{ data: T, meta: { savedAt: number, dataHash: string, version: number } }}
 */
export function stamp(payload) {
  const now = Date.now();
  const dataHash = hash(canonical(payload));
  return {
    data: payload,
    meta: {
      savedAt: now,
      dataHash,
      version: VERSION
    }
  };
}

/**
 * Determine if a stamped payload is still within freshness guarantees.
 * @param {{ meta?: { savedAt?: number } } | null | undefined} stamped
 * @returns {boolean}
 */
export function isFresh(stamped) {
  if (!stamped || !stamped.meta) {
    return false;
  }

  const { savedAt } = stamped.meta;

  if (typeof savedAt !== 'number' || Number.isNaN(savedAt)) {
    return false;
  }

  return Date.now() - savedAt <= CACHE_TTL_MS;
}

export default {
  CACHE_TTL_MS,
  canonical,
  hash,
  stamp,
  isFresh
};