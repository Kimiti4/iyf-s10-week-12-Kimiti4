/**
 * Web Vitals Collection — Core Web Vitals instrumentation
 * Uses the official web-vitals library for accurate measurement
 */

import { onCLS, onFCP, onLCP, onINP, onTTFB } from 'web-vitals';
import registry from './registry';

const METRIC_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 }
};

function classify(metric, value) {
  const thresholds = METRIC_THRESHOLDS[metric];
  if (!thresholds) return 'unknown';
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

function recordVital(metric, data) {
  // Guard: web-vitals v6 invokes the callback with a single Metric object.
  // Callers below adapt it to (name, metric); this guard keeps telemetry
  // from throwing if invoked with an unexpected shape.
  if (!data || typeof data.value !== 'number') {
    return null;
  }
  const entry = registry.record({
    metric: metric,
    value: data.value,
    unit: metric === 'CLS' ? 'score' : 'ms',
    rating: data.rating || classify(metric, data.value),
    navigationType: data.navigationType,
    delta: data.delta,
    id: data.id,
    attribution: data.attribution || null
  });

  if (import.meta?.env?.MODE === 'development') {
    console.log(`[Perf] ${metric}: ${data.value.toFixed(2)} (${entry.rating})`);
  }

  return entry;
}

export function initWebVitals(options = {}) {
  const { reportAllChanges = false } = options;

  // web-vitals v6 callback signature: (metric) => void, where metric is
  // { name, value, rating, delta, id, navigationType, attribution }.
  const handle = (metric) => {
    if (metric && typeof metric.name === 'string') {
      recordVital(metric.name, metric);
    }
  };

  onCLS(handle, { reportAllChanges });
  onFCP(handle, { reportAllChanges });
  onLCP(handle, { reportAllChanges });
  onINP(handle, { reportAllChanges });
  onTTFB(handle, { reportAllChanges });
}

export function getWebVitalsSummary() {
  const metrics = ['CLS', 'FCP', 'LCP', 'INP', 'TTFB'];

  return metrics.reduce((summary, metric) => {
    const stats = registry.aggregate(metric);
    summary[metric] = stats ? {
      p75: stats.p75,
      median: stats.median,
      count: stats.count,
      rating: classify(metric, stats.p75)
    } : null;
    return summary;
  }, {});
}

export default { init: initWebVitals, getSummary: getWebVitalsSummary, thresholds: METRIC_THRESHOLDS };
