# Code Quality Rules

> **You are implementing a production social platform, not a visual prototype.**
> Preserve existing working behavior, respect the design-token system, avoid speculative abstractions, keep domain logic separate from presentation, and do not introduce new navigation or API behavior without an explicit contract. Every feature must have loading, empty, error, success and mobile states. Existing Lighthouse, accessibility and responsive guarantees are regression gates.

> **Never solve a visual problem by weakening a quality gate. Fix the underlying implementation.**

---

## Rule 1 — No giant components

Prefer:

```
JamCard
JamHeader
JamStats
JamParticipants
JamContribution
JamActions
JamComposer
JamResults
```

over:

```
JamPage.jsx   // 1,500 lines
```

**Target:** Components should generally have one clear responsibility.

---

## Rule 2 — Business logic does not belong in JSX

Bad:

```jsx
{users.filter(...).sort(...).slice(...).map(...)}
```

Better:

```js
const rankedParticipants = rankParticipants(users, rankingConfig)
```

Then:

```jsx
<ParticipantList participants={rankedParticipants} />
```

---

## Rule 3 — No duplicated API logic

Never:

```
fetch('/api/jams')
fetch('/api/jam')
fetch('/api/jams/...')
```

randomly throughout components.

Use:

```
services/
  jamApi.js
```

with typed/validated functions.

---

## Rule 4 — Server state ≠ UI state

Keep:

```
server state
  jams
  participants
  contributions
```

separate from:

```
UI state
  modalOpen
  selectedTab
  composerStep
  sidebarOpen
```

Don't turn React context into a global dumping ground.

---

## Rule 5 — Every async operation has explicit states

A component should account for:

```
idle
loading
success
empty
error
```

Not just:

```jsx
{data && ...}
```

---

## Rule 6 — No silent failures

Bad:

```js
try {
  await joinJam()
} catch {}
```

Good:

```js
try {
  await joinJam()
} catch (error) {
  reportError(error)
  showToast('Unable to join this Jam')
}
```

---

## Rule 7 — No magic values

Bad:

```js
if (participants.length > 1000)
```

Better:

```js
const JAM_POPULARITY_THRESHOLD = 1000
```

Even better where appropriate: configuration/domain policy.

---

## Rule 8 — Design tokens only

No:

```css
color: #7c3aed;
background: #111827;
```

inside random components.

Use:

```css
color: var(--brand-primary);
background: var(--surface-elevated);
```

This preserves the visual system.

---

## Rule 9 — Accessibility is a feature requirement

Interactive controls require:

```
keyboard support
focus state
aria-label where necessary
semantic buttons
sufficient contrast
reduced-motion support
```

Never make a `<div>` behave like a button.

---

## Rule 10 — Mobile-first

Every new feature must explicitly support:

```
390px
768px
1024px
1440px
```

before being considered complete.

---

## Rule 11 — Performance budgets

For the initial experience:

```
No unnecessary eager imports
Route-level code splitting
Lazy-load heavy media
Responsive images
No autoplay unless intentional
Avoid layout shifts
```

Lighthouse remains a **gate**, not something to silence.

---

## Rule 12 — No dead routes

Every navigation item must resolve to:

```
real route
real component
real loading state
real empty state
real error state
```

No decorative buttons that lead nowhere.

---

## Rule 13 — API contracts before UI assumptions

Define the domain model first.

For example:

```ts
type JamStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'ended'
  | 'archived'
```

and:

```ts
type ParticipationType =
  | 'video'
  | 'image'
  | 'post'
  | 'poll'
  | 'location'
  | 'skill'
  | 'gig'
```

The frontend should consume a stable contract rather than inventing response shapes.

---

## Rule 14 — Test the behavior, not implementation details

Minimum Jam tests:

```
✓ creator can create Jam
✓ draft can be saved
✓ Jam can be published
✓ user can join
✓ user cannot join twice
✓ contribution is attributed
✓ creator can close Jam
✓ closed Jam rejects contributions
✓ unauthorized user cannot modify Jam
✓ deleted content doesn't break Jam
```

---

## Rule 15 — Every feature needs an architectural boundary

Don't let:

```
Jam
```

become coupled directly to:

```
Marketplace
Farm
Gigs
Skills
Reels
Notifications
```

Instead:

```
Jam
 │
 ├── emits events
 │
 ├── consumes policies
 │
 └── references entities
```

For example:

```
JamCompleted
JamParticipantJoined
JamContributionCreated
JamEnded
```

Other systems can react to those events. That makes the platform extensible.
