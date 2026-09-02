const CRITICAL_STATUS = new Set([500, 502, 503, 504]);

export function attachNetworkPolicy(page) {
  const failedRequests = [];

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();

    if (status >= 400) {
      failedRequests.push({
        url,
        status,
        statusText: response.statusText(),
      });
    }
  });

  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      status: 0,
      statusText: request.failure()?.errorText || 'Network error',
    });
  });

  return {
    getFailedRequests: () => failedRequests,
    getCriticalFailures: () =>
      failedRequests.filter((r) => CRITICAL_STATUS.has(r.status) || r.status === 0),
    assertNoCritical: () => {
      const critical = failedRequests.filter(
        (r) => CRITICAL_STATUS.has(r.status) || r.status === 0
      );
      if (critical.length > 0) {
        const summary = critical
          .map((r) => `  ${r.status} ${r.url}`)
          .join('\n');
        throw new Error(
          `Critical network failures detected:\n${summary}`
        );
      }
    },
  };
}
