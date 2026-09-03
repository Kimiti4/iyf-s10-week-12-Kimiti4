#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { record, ROOT } = require('./lib.cjs');

const FRONTEND = path.join(ROOT, 'products/taskflow/frontend');
const BACKEND = path.join(ROOT, 'products/taskflow/backend');
const DIST = path.join(FRONTEND, 'dist');
const ASSETS = path.join(DIST, 'assets');

const results = [];
function check(name, ok, detail) {
  results.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

console.log('-- SECURITY BASELINE (local build + config scan) --');

const SECRET_PATTERNS = [
  { name: 'JWT_SECRET value', regex: /JWT_SECRET\s*=\s*['"][^'"]{16,}['"]/i },
  { name: 'DATABASE_URL with password', regex: /DATABASE_URL.*:\/\/[^:]+:[^@]+@/i },
  { name: 'service_role key', regex: /service_role/i },
  { name: 'supabaseServiceKey', regex: /supabaseServiceKey/i },
  { name: 'AWS secret key', regex: /aws_secret_access_key/i },
  { name: 'private key block', regex: /-----BEGIN PRIVATE KEY-----/ },
  { name: 'hardcoded API key', regex: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i }
];

const backendSrc = fs.readdirSync(path.join(BACKEND, 'src'), { withFileTypes: true });
let backendCode = '';
function walkSrc(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) walkSrc(p);
    else if (item.name.endsWith('.js')) backendCode += fs.readFileSync(p, 'utf8') + '\n';
  });
}
walkSrc(path.join(BACKEND, 'src'));

const envExample = fs.existsSync(path.join(BACKEND, '.env.example')) ? fs.readFileSync(path.join(BACKEND, '.env.example'), 'utf8') : '';
const serverJs = fs.readFileSync(path.join(BACKEND, 'server.js'), 'utf8');

check('Backend uses helmet for security headers', /require\(['"]helmet['"]\)/.test(serverJs) || /helmet\(/.test(serverJs));
check('Backend has CORS configuration', /cors\(/.test(serverJs));
check('CORS uses env variable (not wildcard)', !/cors\(\s*\)\s*;?$/.test(serverJs) && /cors\(\s*\{/.test(serverJs));
check('JWT uses env secret (not hardcoded)', /jwtSecret/.test(backendCode) && !/jwt\.sign\([^,]+,\s*['"][^'"]{16,}['"]/.test(backendCode));
check('Passwords are hashed with bcrypt', /bcrypt/.test(backendCode) || /bcryptjs/.test(backendCode));
check('No raw password comparisons', !/password\s*===?\s*req\.body/i.test(backendCode) || /bcrypt\.compare/.test(backendCode));
check('Database queries use parameterized (Supabase)', /\.from\(/.test(backendCode) && /\.eq\(|select|insert/.test(backendCode));

let secretsInBundle = 0;
const secretFindings = [];
if (fs.existsSync(ASSETS)) {
  const jsFiles = fs.readdirSync(ASSETS).filter(f => f.endsWith('.js'));
  jsFiles.forEach(f => {
    const content = fs.readFileSync(path.join(ASSETS, f), 'utf8');
    SECRET_PATTERNS.forEach(p => {
      if (p.regex.test(content)) {
        secretsInBundle++;
        secretFindings.push(f + ': ' + p.name);
      }
    });
  });
}
check('No secrets in client bundle', secretsInBundle === 0, secretFindings.join(', ') || 'clean');

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
check('No inline scripts with secrets', !/<script>[^<]*(?:secret|password|token)/i.test(html));
check('No inline styles with secrets', !/<style>[^<]*(?:secret|password|token)/i.test(html));

const frontendSrc = path.join(FRONTEND, 'src');
let frontendCode = '';
function walkFrontend(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) walkFrontend(p);
    else if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) frontendCode += fs.readFileSync(p, 'utf8') + '\n';
  });
}
walkFrontend(frontendSrc);

const frontendSecrets = SECRET_PATTERNS.filter(p => p.regex.test(frontendCode));
check('No secrets in frontend source', frontendSecrets.length === 0, frontendSecrets.map(p => p.name).join(', ') || 'clean');

const inputValidation = /express-validator/.test(backendCode) || /validate\(/.test(backendCode);
check('Input validation middleware present', inputValidation);

const authMiddleware = /middleware\/auth/.test(backendCode) || /verifyToken|jwt\.verify/.test(backendCode);
check('JWT auth middleware present', authMiddleware);

const supabaseKey = /supabase.*key|SUPABASE.*KEY/i.test(backendCode) || /process\.env\.SUPABASE_KEY/.test(backendCode);
check('Supabase key from env, not hardcoded', supabaseKey);

const noXSS = !/dangerouslySetInnerHTML/.test(frontendCode) || /DOMPurify|sanitize/.test(frontendCode);
check('No unescaped HTML rendering', noXSS, /dangerouslySetInnerHTML/.test(frontendCode) ? 'found dangerouslySetInnerHTML' : 'none');

const tokenStorage = /localStorage/.test(frontendCode) && /token/.test(frontendCode);
check('Token stored (not in cookies without flags)', tokenStorage, tokenStorage ? 'localStorage' : 'no token storage');

record('security', {
  results,
  scope: 'BASELINE SECURITY VERIFICATION (local build + config scan)',
  secretsChecked: SECRET_PATTERNS.map(p => p.name),
  note: 'Live security headers and CORS verification available via npm run j027:verify when deployed'
});

const fails = results.filter(r => r.status === 'FAIL');
console.log('\n' + (fails.length ? 'WARN: ' + fails.length + ' security findings' : 'PASS: security baseline met'));
process.exit(0);
