/**
 * Performance Collector — unified entry point
 * Initializes all performance measurement systems
 */

import { initWebVitals, getWebVitalsSummary } from './web-vitals';
import { initNetworkTracking, getNetworkSummary } from './network';
import { initRuntimeTracking, getRuntimeSummary } from './runtime';
import registry from './registry';

export function initPerformanceTracking(options = {}) {
  const {
    webVitals = true,
    network = true,
    runtime = true,
    reportAllChanges = false
  } = options;

  if (webVitals) initWebVitals({ reportAllChanges });
  if (network) initNetworkTracking();
  if (runtime) initRuntimeTracking();
}

export function getPerformanceSummary() {
  return {
    timestamp: new Date().toISOString(),
    webVitals: getWebVitalsSummary(),
    network: getNetworkSummary(),
    runtime: getRuntimeSummary(),
    registrySize: registry.entries.length
  };
}

export function exportPerformanceData() {
  return {
    summary: getPerformanceSummary(),
    entries: registry.export()
  };
}

export function clearPerformanceData() {
  registry.clear();
}

export default {
  init: initPerformanceTracking,
  getSummary: getPerformanceSummary,
  export: exportPerformanceData,
  clear: clearPerformanceData
};
