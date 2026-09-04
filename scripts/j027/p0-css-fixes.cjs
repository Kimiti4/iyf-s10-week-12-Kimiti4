#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'iyf-s10-week-09-Kimiti4', 'src');
let totalFiles = 0;
let totalFixes = 0;

function fixFile(filePath) {
  const rel = path.relative(SRC, filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  let out = text;
  let fileFixes = 0;

  // ─── 1. Find the "root class" ───
  // First .foo { selector in the file
  const rootMatch = out.match(/^\.([a-zA-Z0-9_-]+)\s*\{/m);
  if (!rootMatch) return; // No class selector, skip
  const rootClass = '.' + rootMatch[1];

  // ─── 2. Fix [data-theme='dark'] & { ───
  const darkNest = /\[data-theme=['"]dark['"]\]\s*&\s*\{/g;
  if (darkNest.test(out)) {
    out = out.replace(darkNest, `[data-theme='dark'] ${rootClass} {`);
    fileFixes++;
  }

  // ─── 3. Fix self-referential fallbacks: var(--x, var(--x)) → var(--x) ───
  const selfRef = /var\((--[a-zA-Z0-9_-]+),\s*var\(\1\)\)/g;
  const selfRefCount = (out.match(selfRef) || []).length;
  if (selfRefCount > 0) {
    out = out.replace(selfRef, 'var($1)');
    fileFixes += selfRefCount;
  }

  // ─── 4. Also fix double-self: var(--x, var(--x, var(--x))) ───
  const deepSelf = /var\((--[a-zA-Z0-9_-]+),\s*var\(\1,\s*var\(\1\)\)\)/g;
  const deepCount = (out.match(deepSelf) || []).length;
  if (deepCount > 0) {
    out = out.replace(deepSelf, 'var($1)');
    fileFixes += deepCount;
  }

  if (out !== text) {
    fs.writeFileSync(filePath, out, 'utf8');
    totalFiles++;
    totalFixes += fileFixes;
    console.log(`  [OK] ${rel}  (${fileFixes} fix${fileFixes === 1 ? '' : 'es'})  rootClass=${rootClass}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
      walk(p);
    } else if (e.isFile() && p.endsWith('.css')) {
      fixFile(p);
    }
  }
}

console.log('P0 CSS remediation — fixing & nesting and self-referential fallbacks\n');
console.log(`Scanning: ${SRC}\n`);
walk(SRC);
console.log(`\nDone. ${totalFiles} file(s) modified, ${totalFixes} fix(es) applied.\n`);
