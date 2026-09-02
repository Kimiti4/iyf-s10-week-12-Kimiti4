# J-021 Repository Inventory

## Project: JamiiLink 2.0

| Aspect | Value |
|---|---|
| Framework | React 18.2 (JSX) |
| Build | Vite 7.0 |
| Routing | react-router-dom v6.20 (BrowserRouter) |
| State | React Context (AuthContext, OrganizationContext, SidebarContext) |
| Styling | CSS custom properties (tokens.css), vanilla CSS |
| Icons | react-icons ^5.6.0 |
| Animations | framer-motion ^12.38.0 |
| Real-time | socket.io-client ^4.8.3 |
| Testing | Playwright (e2e, a11y), Lighthouse CI, axe-core |
| Linting | ESLint 9 |
| PWA | vite-plugin-pwa |
| Compression | vite-plugin-compression (brotli) |

## File Counts

| Directory | Files |
|---|---|
| src/components/ | 136 |
| src/pages/ | 51 |
| src/enhanced/ | 24 |
| src/hooks/ | 20 |
| src/services/ | 15 |
| src/domain/ | 15 |
| src/utils/ | 9 |
| src/styles/ | 9 |
| src/contracts/ | 4 |
| src/context/ | 3 |
| src/models/ | 3 |
| src/routes/ | 2 |
| **Total** | **295** |

## Design Token System

Canonical tokens defined in `src/styles/tokens.css` with dark mode overrides under `[data-theme='dark']` / `.dark-mode`. Extended tokens in `src/index.css` (type scale, z-index, shadows, transitions). JS tokens in `src/styles/designSystem.js`.

## Lazy Loading

All page-level components use `React.lazy()` + `<Suspense>` in `App.jsx`. Manual chunk splitting configured in `vite.config.js`: react-vendor, framer-motion, icons, socket-io.

## Provider Hierarchy

Router > AuthProvider > OrganizationProvider > SidebarProvider > ToastProvider
