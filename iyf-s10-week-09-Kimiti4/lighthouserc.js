/**
 * Lighthouse CI config (npm i -D @lhci/cli, then npx lhci autorun).
 * Uses Vite's preview server for an accurate production-like build.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:   http://localhost:',
      startServerTimeout: 60000,
      url: ['http://localhost:4173/', 'http://localhost:4173/login', 'http://localhost:4173/register'],
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        // Skip audits that commonly false-fail on SPAs
        skipAudits: ['uses-http2', 'offscreen-images', 'render-blocking-resources'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};