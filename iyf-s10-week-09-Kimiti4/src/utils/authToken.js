/**
 * R5 [P0-7] In-memory access-token store.
 *
 * The short-lived access JWT lives ONLY in module memory (never in
 * localStorage/sessionStorage/IndexedDB/cookies). A page reload drops it;
 * the app then uses the HttpOnly refresh cookie (POST /api/auth/refresh)
 * to obtain a fresh one. This bounds XSS token theft to the lifetime of
 * the page session instead of persistent storage.
 */

let memoryToken = null;
const listeners = new Set();

export function setAccessToken(token) {
  memoryToken = token || null;
  listeners.forEach((fn) => {
    try { fn(memoryToken); } catch { /* ignore listener errors */ }
  });
}

export function getAccessToken() {
  return memoryToken;
}

export function clearAccessToken() {
  setAccessToken(null);
}

export function onAccessTokenChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
