/**
 * Performance Registry — stores and retrieves performance metrics
 * Provides a unified interface for metric storage across sessions
 */

const REGISTRY_KEY = 'jamii_perf_registry';
const MAX_ENTRIES = 1000;

class PerformanceRegistry {
  constructor() {
    this.entries = this.loadFromStorage() || [];
  }

  record(metric) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      route: this.getCurrentRoute(),
      viewport: this.getViewport(),
      environment: this.getEnvironment(),
      ...metric
    };

    this.entries.push(entry);

    if (this.entries.length > MAX_ENTRIES) {
      this.entries = this.entries.slice(-MAX_ENTRIES);
    }

    this.saveToStorage();
    return entry;
  }

  query(criteria = {}) {
    return this.entries.filter(entry => {
      return Object.keys(criteria).every(key => {
        if (Array.isArray(criteria[key])) {
          return criteria[key].includes(entry[key]);
        }
        return entry[key] === criteria[key];
      });
    });
  }

  aggregate(metricName, criteria = {}) {
    const entries = this.query({ metric: metricName, ...criteria });

    if (entries.length === 0) return null;

    const values = entries.map(e => e.value).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;

    values.sort((a, b) => a - b);

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      p75: values[Math.floor(values.length * 0.75)],
      p90: values[Math.floor(values.length * 0.90)],
      p95: values[Math.floor(values.length * 0.95)]
    };
  }

  clear() {
    this.entries = [];
    this.saveToStorage();
  }

  export() {
    return [...this.entries];
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentRoute() {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return 'unknown';
  }

  getViewport() {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return null;
  }

  getEnvironment() {
    return import.meta?.env?.MODE || 'production';
  }

  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(REGISTRY_KEY);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(this.entries));
      } catch {
        // Storage full or unavailable
      }
    }
  }
}

export const registry = new PerformanceRegistry();
export default registry;
