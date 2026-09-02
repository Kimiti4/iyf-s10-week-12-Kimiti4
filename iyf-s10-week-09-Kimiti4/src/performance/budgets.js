export const BUDGETS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
  BUNDLE: {
    totalJs: 200 * 1024,
    totalCss: 50 * 1024,
    initialJs: 100 * 1024,
    largestChunk: 50 * 1024,
  },
  ROUTE: {
    loadTime: { good: 1000, poor: 3000 },
    tti: { good: 2000, poor: 5000 },
  }
};

export function evaluateMetric(name, value) {
  const budget = BUDGETS[name] || BUDGETS.ROUTE.loadTime;
  if (value <= budget.good) return { status: 'PASS', rating: 'good', value, budget };
  if (value <= budget.poor) return { status: 'WARN', rating: 'needs-improvement', value, budget };
  return { status: 'FAIL', rating: 'poor', value, budget };
}
