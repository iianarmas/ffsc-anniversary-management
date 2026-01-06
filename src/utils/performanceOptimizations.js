/**
 * Performance Optimization Utilities
 * Debouncing, throttling, and memoization helpers for filter operations
 */

/**
 * Debounce function - delays execution until after a pause in calls
 * Useful for search inputs, filter changes, etc.
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;

  const debounced = function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = function () {
    clearTimeout(timeout);
  };

  return debounced;
}

/**
 * Throttle function - limits execution to once per time period
 * Useful for scroll handlers, resize events, etc.
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize function results - caches results based on arguments
 *
 * @param {Function} func - Function to memoize
 * @param {Function} keyGenerator - Optional custom key generator
 * @returns {Function} Memoized function
 */
export function memoize(func, keyGenerator) {
  const cache = new Map();

  return function memoized(...args) {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);

    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
}

/**
 * Create an indexed map for fast lookups
 * Pre-computes indexes for common filter fields to enable O(1) lookups
 *
 * @param {Array} people - Array of person objects
 * @param {Array} fields - Fields to index
 * @returns {Object} Indexed map
 */
export function createIndexMap(people, fields = ['location', 'paid', 'shirtGiven']) {
  const indexes = {};

  fields.forEach(field => {
    indexes[field] = {};

    people.forEach((person, index) => {
      const value = person[field];
      const key = String(value);

      if (!indexes[field][key]) {
        indexes[field][key] = [];
      }

      indexes[field][key].push(index);
    });
  });

  return indexes;
}

/**
 * Batch process array in chunks to avoid blocking UI
 * Useful for processing large datasets
 *
 * @param {Array} items - Items to process
 * @param {Function} processFn - Function to process each item
 * @param {number} chunkSize - Items per chunk
 * @returns {Promise} Promise that resolves when complete
 */
export async function batchProcess(items, processFn, chunkSize = 100) {
  const results = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    // Process chunk
    const chunkResults = chunk.map(processFn);
    results.push(...chunkResults);

    // Yield to browser to prevent blocking
    if (i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return results;
}

/**
 * Create a lazy loader that loads data in batches as needed
 * Useful for virtual scrolling, infinite scroll, etc.
 *
 * @param {Array} items - All items
 * @param {number} pageSize - Items per page
 * @returns {Object} Lazy loader interface
 */
export function createLazyLoader(items, pageSize = 50) {
  let currentPage = 0;
  const totalPages = Math.ceil(items.length / pageSize);

  return {
    hasMore: () => currentPage < totalPages - 1,
    loadMore: () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
      }
      return items.slice(0, (currentPage + 1) * pageSize);
    },
    reset: () => {
      currentPage = 0;
      return items.slice(0, pageSize);
    },
    getAll: () => items,
    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
  };
}

/**
 * Measure performance of a function
 * Useful for identifying bottlenecks
 *
 * @param {Function} func - Function to measure
 * @param {string} label - Label for console output
 * @returns {Function} Wrapped function that logs performance
 */
export function measurePerformance(func, label) {
  return function measured(...args) {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();

    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);

    return result;
  };
}

/**
 * Check if dataset is large and may need special handling
 *
 * @param {Array} data - Dataset to check
 * @param {number} threshold - Size threshold (default 1000)
 * @returns {boolean} True if large dataset
 */
export function isLargeDataset(data, threshold = 1000) {
  return Array.isArray(data) && data.length > threshold;
}

/**
 * Web Worker helper for offloading heavy computation
 * Note: Requires a separate worker file
 *
 * @param {string} workerUrl - URL to worker script
 * @param {*} data - Data to send to worker
 * @returns {Promise} Promise that resolves with worker result
 */
export function runInWorker(workerUrl, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    worker.postMessage(data);

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Worker timeout'));
      worker.terminate();
    }, 10000);
  });
}

/**
 * Simple LRU (Least Recently Used) cache
 * Useful for caching filter results, statistics, etc.
 */
export class LRUCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    // Remove if exists (to re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Remove oldest if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}
