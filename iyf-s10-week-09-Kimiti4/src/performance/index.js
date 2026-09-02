/**
 * Performance Module — public API
 */

export {
  initPerformanceTracking,
  getPerformanceSummary,
  exportPerformanceData,
  clearPerformanceData
} from './collector';

export { getWebVitalsSummary } from './web-vitals';
export { getNetworkSummary } from './network';
export { getRuntimeSummary } from './runtime';
export { registry } from './registry';

export { default } from './collector';
