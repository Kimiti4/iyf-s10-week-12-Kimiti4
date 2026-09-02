/**
 * Runtime Performance Tracking
 * Monitors main-thread activity, long tasks, and blocking time
 */

import registry from './registry';

const LONG_TASK_THRESHOLD = 50;

function trackLongTasks() {
  if (typeof PerformanceObserver === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > LONG_TASK_THRESHOLD) {
        recordLongTask(entry);
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // Long task observer not supported
  }
}

function recordLongTask(entry) {
  registry.record({
    metric: 'long_task',
    duration: entry.duration,
    startTime: entry.startTime,
    name: entry.name,
    attribution: entry.attribution || null
  });
}

function trackNavigationTiming() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const timing = performance.timing;
      if (timing) {
        registry.record({
          metric: 'navigation_timing',
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          load: timing.loadEventEnd - timing.navigationStart,
          domInteractive: timing.domInteractive - timing.navigationStart,
          responseEnd: timing.responseEnd - timing.navigationStart,
          requestStart: timing.requestStart - timing.navigationStart
        });
      }
    }, 0);
  });
}

export function getRuntimeSummary() {
  const longTasks = registry.query({ metric: 'long_task' });
  const navTiming = registry.query({ metric: 'navigation_timing' });

  const totalBlockingTime = longTasks.reduce((sum, task) => {
    return sum + Math.max(0, task.duration - LONG_TASK_THRESHOLD);
  }, 0);

  const avgLongTaskDuration = longTasks.length > 0
    ? longTasks.reduce((sum, t) => sum + t.duration, 0) / longTasks.length
    : 0;

  const latestNav = navTiming.length > 0 ? navTiming[navTiming.length - 1] : null;

  return {
    longTaskCount: longTasks.length,
    totalBlockingTime,
    avgLongTaskDuration,
    navigationTiming: latestNav ? {
      domContentLoaded: latestNav.domContentLoaded,
      load: latestNav.load,
      domInteractive: latestNav.domInteractive
    } : null
  };
}

export function initRuntimeTracking() {
  trackLongTasks();
  trackNavigationTiming();
}

export default { init: initRuntimeTracking, getSummary: getRuntimeSummary };
