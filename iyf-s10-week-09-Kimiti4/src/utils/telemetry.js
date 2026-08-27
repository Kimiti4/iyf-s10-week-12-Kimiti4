const sentryEnabled = Boolean(import.meta.env.VITE_SENTRY_DSN)
const getSentry = () => globalThis.Sentry

export function initTelemetry() {
  const sentry = getSentry()
  if (sentryEnabled && sentry?.init) {
    sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
      environment: import.meta.env.MODE,
    })
  }
}

export function captureException(error, context = {}) {
  getSentry()?.captureException?.(error, { extra: context })
}

export function trackMetric(name, value, tags = {}) {
  getSentry()?.metrics?.distribution?.(name, value, { attributes: tags })
}

export async function fetchWithTelemetry(url, options = {}) {
  const startedAt = performance.now()

  try {
    const response = await fetch(url, options)
    trackMetric('api.latency', performance.now() - startedAt, {
      method: options.method || 'GET',
      status: response.status,
    })
    if (!response.ok) {
      trackMetric('api.errors', 1, { method: options.method || 'GET', status: response.status })
    }
    return response
  } catch (error) {
    captureException(error, { url, method: options.method || 'GET' })
    trackMetric('api.errors', 1, { method: options.method || 'GET', network: true })
    throw error
  }
}

export function trackSyncResult(success) {
  trackMetric('sw.sync', success ? 1 : 0, { success })
}

export function trackCNF(cnf) {
  trackMetric('simulation.cnf', cnf, { threshold_met: cnf > 0.5 })
}
