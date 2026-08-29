/**
 * Local verification for the LHCI console-error gate.
 *
 * Starts the same stub server LHCI uses (scripts/lhci-server.mjs), then loads
 * every URL from lighthouserc.json in Chromium and fails if ANY browser
 * console error or failed request occurs — the exact condition that makes
 * Lighthouse's `errors-in-console` / best-practices audit score 0.
 *
 * Usage: node scripts/verify-no-console-errors.mjs
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import { chromium } from '@playwright/test';

const URLS = ['http://localhost:4173/', 'http://localhost:4173/login', 'http://localhost:4173/register'];

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      http.get(url, () => resolve()).on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error('server never came up'));
        else setTimeout(tryOnce, 300);
      });
    };
    tryOnce();
  });
}

const server = spawn(process.execPath, ['scripts/lhci-server.mjs'], {
  stdio: 'ignore',
  detached: false,
});

let failures = 0;

try {
  await waitForServer('http://localhost:4173/');
  const browser = await chromium.launch();

  for (const url of URLS) {
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
    page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));
    page.on('response', (res) => {
      if (res.status() >= 400) problems.push(`HTTP ${res.status()}: ${res.url()}`);
    });

    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2500); // let lazy work (SW registration, etc.) surface

    if (problems.length === 0) {
      console.log(`PASS  ${url}`);
    } else {
      failures += 1;
      console.log(`FAIL  ${url}`);
      for (const p of problems) console.log(`        ${p}`);
    }
    await page.close();
  }

  await browser.close();
} finally {
  server.kill();
}

process.exit(failures === 0 ? 0 : 1);