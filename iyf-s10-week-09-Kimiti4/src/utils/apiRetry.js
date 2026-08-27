/**
 * 🔁 API Retry Utility — exponential backoff for transient failures.
 *
 * Use ONLY for idempotent (safe, read-only) requests. Retrying a mutation
 * could create duplicates if the server processed it but the response was lost.
 *
 * @param {() => Promise<any>} fn        The async operation to retry
 * @param {number} [retries=3]           Max total attempts
 * @param {number} [baseDelay=800]       Initial delay in ms (doubles each retry)
 * @returns {Promise<any>}
 */
export async function fetchWithRetry(fn, retries = 3, baseDelay = 800) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries - 1) break;
      const delay = baseDelay * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}

export default fetchWithRetry;