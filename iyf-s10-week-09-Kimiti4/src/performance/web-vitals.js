import { evaluateMetric } from './budgets.js';

const vitals = {};
const callbacks = [];

function notify() {
  callbacks.forEach(cb => cb({ ...vitals }));
}

export function onWebVitals(cb) {
  callbacks.push(cb);
  if (Object.keys(vitals).length > 0) cb({ ...vitals });
}

let lcpValue = 0;
const lcpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1];
  if (last) {
    lcpValue = last.startTime;
    vitals.LCP = { value: lcpValue, ...evaluateMetric('LCP', lcpValue) };
    notify();
  }
});
try { lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}

let clsValue = 0;
let clsSessionValue = 0;
const clsObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsSessionValue += entry.value;
      if (clsSessionValue > clsValue) {
        clsValue = clsSessionValue;
        vitals.CLS = { value: clsValue, ...evaluateMetric('CLS', clsValue) };
        notify();
      }
    }
  }
});
try { clsObserver.observe({ type: 'layout-shift', buffered: true }); } catch {}

const paintObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      vitals.FCP = { value: entry.startTime, ...evaluateMetric('FCP', entry.startTime) };
      notify();
    }
  }
});
try { paintObserver.observe({ type: 'paint', buffered: true }); } catch {}

const navEntries = performance.getEntriesByType('navigation');
if (navEntries.length > 0) {
  const nav = navEntries[0];
  const ttfb = nav.responseStart - nav.requestStart;
  vitals.TTFB = { value: ttfb, ...evaluateMetric('TTFB', ttfb) };
}

let maxINP = 0;
const inpObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const duration = entry.duration;
    if (duration > maxINP) {
      maxINP = duration;
      vitals.INP = { value: maxINP, ...evaluateMetric('INP', maxINP) };
      notify();
    }
  }
});
try { inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 }); } catch {}

export function getWebVitals() {
  return { ...vitals };
}
