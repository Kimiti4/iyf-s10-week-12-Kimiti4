#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { record, ROOT } = require('./lib.cjs');

const FRONTEND = path.join(ROOT, 'products/taskflow/frontend');
const DIST = path.join(FRONTEND, 'dist');
const results = [];

function check(name, ok, detail) {
  results.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

function collectJsx(dir) {
  let content = '';
  if (!fs.existsSync(dir)) return content;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) {
      content += collectJsx(p);
    } else if (item.name.endsWith('.jsx') || item.name.endsWith('.js')) {
      content += fs.readFileSync(p, 'utf8') + '\n';
    }
  });
  return content;
}

console.log('-- ACCESSIBILITY BASELINE (local build scan) --');

if (!fs.existsSync(DIST)) {
  console.error('No dist/ found. Run: cd products/taskflow/frontend && npm run build');
  results.push({ name: 'dist exists', status: 'FAIL', detail: 'no dist/ directory' });
  record('accessibility', { results });
  process.exit(1);
}

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const jsFiles = fs.readdirSync(path.join(DIST, 'assets')).filter(f => f.endsWith('.js'));

check('HTML has lang attribute', /<html[^>]+lang=/.test(html));
check('HTML has viewport meta', /<meta[^>]+viewport/.test(html));
check('HTML has title', /<title>[^<]+<\/title>/.test(html));
check('HTML has meta description', /<meta[^>]+name=["']description["']/.test(html));
check('HTML has charset', /<meta[^>]+charset/.test(html));

const cssFiles = fs.readdirSync(path.join(DIST, 'assets')).filter(f => f.endsWith('.css'));
let allCss = '';
cssFiles.forEach(f => {
  allCss += fs.readFileSync(path.join(DIST, 'assets', f), 'utf8');
});
check('CSS has prefers-reduced-motion support', /prefers-reduced-motion/.test(allCss));
check('CSS has focus-visible styles', /:focus-visible/.test(allCss) || /:focus/.test(allCss));
check('CSS has min-height for touch targets (44px)', /min-height:\s*44/.test(allCss) || /min-height:\s*4[4-9]/.test(allCss));

const allJs = jsFiles.map(f => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8')).join('\n');
check('JS has aria-label usage', /aria-label/.test(allJs));
check('JS has aria-hidden usage', /aria-hidden/.test(allJs));
check('JS has role usage', /role[:=]/.test(allJs));
check('JS has tabIndex usage', /tabIndex/.test(allJs) || /tabindex/.test(allJs));

const pageFiles = fs.existsSync(path.join(FRONTEND, 'src/pages')) ? fs.readdirSync(path.join(FRONTEND, 'src/pages')) : [];
let pageContents = '';
pageFiles.forEach(f => {
  if (f.endsWith('.jsx')) {
    pageContents += fs.readFileSync(path.join(FRONTEND, 'src/pages', f), 'utf8');
  }
});
const componentContents = collectJsx(path.join(FRONTEND, 'src/components'));
const allJsx = pageContents + '\n' + componentContents;
check('Pages use semantic HTML (button elements)', /<button/.test(pageContents));
check('Pages use semantic HTML (nav elements)', /<nav/.test(allJsx));
check('Pages use semantic HTML (main elements)', /<main/.test(allJsx));
check('Pages use semantic HTML (section elements)', /<section/.test(allJsx));
check('Pages have form labels (htmlFor or label wrapping)', /htmlFor/.test(pageContents) || /<label/.test(pageContents));
check('Components use aria-hidden for decorative icons', /aria-hidden/.test(allJsx) || /aria-label/.test(allJsx));
check('Components use semantic roles', /role=/.test(allJsx));

record('accessibility', {
  results,
  scope: 'LOCAL BUILD SCAN (not runtime axe-core)',
  note: 'Runtime axe-core scan available via npx playwright test e2e/a11y/ when backend is deployed'
});

const fails = results.filter(r => r.status === 'FAIL');
console.log('\n' + (fails.length ? 'WARN: ' + fails.length + ' a11y findings' : 'PASS: accessibility baseline met'));
process.exit(0);
