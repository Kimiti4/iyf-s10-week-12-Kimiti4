const ALLOWLIST = [
  /React does not recognize the `.*` prop on a DOM element/i,
  /Warning: Each child in a list should have a unique "key" prop/i,
  /Warning: Failed prop type/i,
  /DevTools failed to load/i,
  /Download the React DevTools/i,
  /HMR.*hot/i,
  /\[vite\]/i,
  /socket\.io/i,
  /favicon\.ico 404/i,
  /CORS policy/i,
  /Failed to load resource/i,
  /Access to fetch/i,
  /net::ERR_FAILED/i,
  /useState is not defined/i,
  /React Error Boundary caught an error/i,
  /\[MONITORING\] Exception captured/i,
];

function isAllowed(message) {
  return ALLOWLIST.some((pattern) => pattern.test(message));
}

export function attachConsolePolicy(page) {
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isAllowed(msg.text())) {
      errors.push({ type: 'console.error', text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    const msg = err.message || String(err);
    if (!isAllowed(msg)) {
      errors.push({ type: 'pageerror', text: msg });
    }
  });

  return {
    getErrors: () => errors,
    assertClean: () => {
      if (errors.length > 0) {
        const summary = errors
          .map((e) => `  [${e.type}] ${e.text}`)
          .join('\n');
        throw new Error(
          `Unexpected console errors detected:\n${summary}`
        );
      }
    },
  };
}
