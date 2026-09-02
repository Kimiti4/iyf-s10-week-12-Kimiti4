import { BUDGETS, evaluateMetric } from './budgets.js';

const metrics = {};
const observers = [];

export function collectNavigationTiming() {
  const nav = performance.getEntriesByType('navigation')[0];
  if (!nav) return null;
  return {
    ttfb: nav.responseStart - nav.requestStart,
    fcp: 0,
    domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
    load: nav.loadEventEnd - nav.startTime,
    transferSize: nav.transferSize,
    encodedBodySize: nav.encodedBodySize,
    decodedBodySize: nav.decodedBodySize,
  };
}

export function collectPaintTiming() {
  const paints = performance.getEntriesByType('paint');
  const fcp = paints.find(p => p.name === 'first-contentful-paint');
  return fcp ? { fcp: fcp.startTime } : null;
}

export function collectLargestContentfulPaint() {
  return new Promise((resolve) => {
    let lcp = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) lcp = last.startTime;
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(observer);
    setTimeout(() => {
      observer.disconnect();
      resolve({ lcp });
    }, 10000);
  });
}

export function collectCumulativeLayoutShift() {
  let cls = 0;
  let sessionValue = 0;
  let sessionEntries = [];
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        const value = entry.value;
        if (sessionValue + value < cls) {
          sessionEntries.push(entry);
          sessionValue += value;
        } else {
          sessionValue = value;
          sessionEntries = [entry];
        }
        if (sessionValue > cls) {
          cls = sessionValue;
        }
      }
    }
  });
  observer.observe({ type: 'layout-shift', buffered: true });
  observers.push(observer);
  return { cls, getSessionEntries: () => sessionEntries };
}

export function collectBundleMetrics() {
  const scripts = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script');
  const styles = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'link' || r.initiatorType === 'css');
  const totalJsTransfer = scripts.reduce((sum, s) => sum + (s.transferSize || 0), 0);
  const totalCssTransfer = styles.reduce((sum, s) => sum + (s.transferSize || 0), 0);
  const largestScript = Math.max(...scripts.map(s => s.transferSize || 0), 0);
  return {
    totalJsTransfer,
    totalCssTransfer,
    largestScript,
    scriptCount: scripts.length,
    styleCount: styles.length,
  };
}

export function collectAllMetrics() {
  const nav = collectNavigationTiming();
  const paint = collectPaintTiming();
  const bundle = collectBundleMetrics();
  const result = {
    timestamp: Date.now(),
    url: window.location.href,
    ...nav,
    ...paint,
    ...bundle,
  };
  result.evaluations = {};
  if (result.ttfb) result.evaluations.ttfb = evaluateMetric('TTFB', result.ttfb);
  if (result.fcp) result.evaluations.fcp = evaluateMetric('FCP', result.fcp);
  return result;
}

export function cleanup() {
  observers.forEach(o => { try { o.disconnect(); } catch {} });
  observers.length = 0;
}
