#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const SERVER_JS = path.join(ROOT, 'products/taskflow/backend/server.js');
const ROUTES_DIR = path.join(ROOT, 'products/taskflow/backend/src/routes');

const mounts = [];
const routes = [];

const serverSrc = fs.readFileSync(SERVER_JS, 'utf8');
serverSrc.split('\n').forEach((line, i) => {
  const m = line.match(/app\.use\(\s*['"]([^'"]+)['"]\s*,\s*(\w+Routes)/);
  if (m) {
    const fileMap = {
      'authRoutes': './src/routes/auth',
      'orgRoutes': './src/routes/orgs',
      'projectRoutes': './src/routes/projects',
      'taskRoutes': './src/routes/tasks',
      'labelRoutes': './src/routes/labels',
      'activityRoutes': './src/routes/activity',
      'searchRoutes': './src/routes/search',
      'dashboardRoutes': './src/routes/dashboard',
      'healthRoutes': './src/routes/health'
    };
    mounts.push({ prefix: m[1], var: m[2], file: fileMap[m[2]] || 'unknown', at: 'server.js:' + (i + 1) });
  }
});

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (/\.js$/.test(e.name)) return [p];
    return [];
  });
}

walk(ROUTES_DIR).forEach(file => {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const methodMatch = line.match(/router\.(get|post|put|patch|delete)\(\s*$/);
    if (methodMatch) {
      const method = methodMatch[1].toUpperCase();
      let pathLine = line;
      let pathLineIdx = i;
      if (!/['"`]/.test(pathLine)) {
        pathLine = lines[i + 1] || '';
        pathLineIdx = i + 1;
      }
      const pathMatch = pathLine.match(/['"`]([^'"`]+)['"`]/);
      if (pathMatch) {
        const fileName = path.basename(file).replace('.js', '');
        const matchingMounts = mounts.filter(mt => mt.file && mt.file.includes(fileName));
        matchingMounts.forEach(mt => {
          const fullPath = mt.prefix + (pathMatch[1] === '/' ? '' : pathMatch[1]);
          routes.push({
            method: method,
            path: pathMatch[1],
            full: fullPath,
            mount: mt.at,
            file: path.relative(ROOT, file),
            line: pathLineIdx + 1
          });
        });
      }
    } else {
      const m = line.match(/router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/i);
      if (m) {
        const fileName = path.basename(file).replace('.js', '');
        const matchingMounts = mounts.filter(mt => mt.file && mt.file.includes(fileName));
        matchingMounts.forEach(mt => {
          const fullPath = mt.prefix + (m[2] === '/' ? '' : m[2]);
          routes.push({
            method: m[1].toUpperCase(),
            path: m[2],
            full: fullPath,
            mount: mt.at,
            file: path.relative(ROOT, file),
            line: i + 1
          });
        });
      }
    }
  }
});

const outDir = path.join(ROOT, 'docs/audits/J027/predeploy');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'backend-inventory.json'), JSON.stringify({ mounts, routes }, null, 2));
console.log('Backend inventory: ' + routes.length + ' route bindings');
routes.forEach(r => console.log('  ' + r.method.padEnd(6) + ' ' + r.full + '  (' + r.file + ':' + r.line + ' via ' + r.mount + ')'));
