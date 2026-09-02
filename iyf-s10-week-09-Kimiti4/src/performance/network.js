/**
 * Network Performance Tracking
 * Monitors resource loading, API calls, and network behavior
 */

import registry from './registry';

function trackResources() {
  if (typeof PerformanceObserver === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
        recordNetworkRequest(entry);
      } else if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
        recordAssetLoad(entry);
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch {
    // Resource timing not supported
  }
}

function recordNetworkRequest(entry) {
  registry.record({
    metric: 'network_request',
    url: entry.name,
    method: entry.initiatorType,
    duration: entry.duration,
    transferSize: entry.transferSize || 0,
    encodedBodySize: entry.encodedBodySize || 0,
    decodedBodySize: entry.decodedBodySize || 0,
    startTime: entry.startTime,
    responseEnd: entry.responseEnd,
    protocol: entry.nextHopProtocol
  });
}

function recordAssetLoad(entry) {
  registry.record({
    metric: 'asset_load',
    url: entry.name,
    type: entry.initiatorType,
    duration: entry.duration,
    transferSize: entry.transferSize || 0,
    encodedBodySize: entry.encodedBodySize || 0,
    decodedBodySize: entry.decodedBodySize || 0,
    startTime: entry.startTime,
    responseEnd: entry.responseEnd
  });
}

export function getNetworkSummary() {
  const requests = registry.query({ metric: 'network_request' });
  const assets = registry.query({ metric: 'asset_load' });

  const totalTransferSize = [
    ...requests.map(r => r.transferSize),
    ...assets.map(a => a.transferSize)
  ].reduce((sum, size) => sum + size, 0);

  const avgRequestDuration = requests.length > 0
    ? requests.reduce((sum, r) => sum + r.duration, 0) / requests.length
    : 0;

  return {
    requestCount: requests.length,
    assetCount: assets.length,
    totalTransferSize,
    avgRequestDuration,
    slowestRequests: requests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(r => ({ url: r.url, duration: r.duration }))
  };
}

export function initNetworkTracking() {
  trackResources();
}

export default { init: initNetworkTracking, getSummary: getNetworkSummary };
