#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const API_DIR = path.join(ROOT, 'products/taskflow/frontend/src/api');

function norm(p) {
  let hadConditional = false;
  const condMatch = p.match(/\$\{[^}]*\?\s*'[^']*'\s*\+/);
  if (condMatch) {
    p = p.substring(0, condMatch.index);
    hadConditional = true;
  }
  p = p.replace(/\$\{[\s\S]+?\}/g, ':p');
  if (hadConditional) {
    p = p.replace(/:p$/, '');
  }
  p = p.replace(/'/g, '');
  return p.trim();
}

function scanFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const methodMatch = line.match(/\b(get|post|put|patch|del|delete)\(\s*(['"`])/i);
    if (!methodMatch) continue;
    const method = methodMatch[1].toUpperCase() === 'DEL' ? 'DELETE' : methodMatch[1].toUpperCase();
    const quote = methodMatch[2];
    const afterQuote = methodMatch.index + methodMatch[0].length;
    let searchLine = line;
    let searchFrom = afterQuote;
    let closeIdx = searchLine.indexOf(quote, searchFrom);
    while (closeIdx === -1 && i < lines.length - 1) {
      i++;
      searchLine += '\n' + lines[i];
      closeIdx = searchLine.lastIndexOf(quote);
    }
    if (closeIdx === -1) continue;
    const raw = searchLine.substring(searchFrom, closeIdx);
    out.push({
      method: method,
      path: norm(raw),
      file: path.relative(ROOT, file),
      line: methodMatch.index >= 0 ? (line.substring(0, methodMatch.index).split('\n').length + (i - (searchLine.split('\n').length - 1))) : i + 1
    });
  }
  return out;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (/\.(js|jsx|ts|tsx)$/.test(e.name)) return [p];
    return [];
  });
}

const inventory = walk(API_DIR).flatMap(scanFile);
const outDir = path.join(ROOT, 'docs/audits/J027/predeploy');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'frontend-inventory.json'), JSON.stringify(inventory, null, 2));
console.log('Frontend inventory: ' + inventory.length + ' calls');
inventory.forEach(c => console.log('  ' + c.method.padEnd(6) + ' ' + c.path + '  (' + c.file + ':' + c.line + ')'));
