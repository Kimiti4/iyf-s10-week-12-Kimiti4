# J-017 Distribution Architecture

## Overview

J-017 introduces three distinct content-distribution primitives to JamiiLink:

| Action | Meaning | Result |
|--------|---------|--------|
| **Share** | Send content somewhere | Private/external distribution |
| **Repost** | Put existing content onto your feed | Attribution preserved |
| **Remix** | Create something new from existing content | New creative object + source attribution |

## Architecture

```
src/
├── domain/
│   └── distribution/
│       ├── distributionTypes.js    — Canonical types and typedefs
│       ├── distributionRules.js    — Validation rules (canRepost, canRemix, buildShareUrl)
│       └── distributionUtils.js    — Helpers (canUseNativeShare, formatRepostCount, buildRemixPreview)
│
├── services/
│   └── distributionApi.js          — Backend adapter (share, repost, undoRepost, createRemix)
│
├── hooks/
│   └── useDistribution.js          — Orchestration hook (share, repost, undoRepost, remix)
│
└── components/
    └── distribution/
        ├── ShareSheet.jsx          — Share bottom sheet (native share + clipboard)
        ├── RepostButton.jsx        — Toggle repost button with count
        ├── RemixButton.jsx         — Remix button with permission check
        ├── RemixAttribution.jsx    — "Remixed from @creator" display
        └── DistributionMenu.jsx    — Combined actions menu
```

## Key Design Decisions

### 1. Repost is not a copy

A repost retains:
- Original creator
- Original content
- Original timestamp
- Original engagement

While adding:
- Reposted by `<user>`

The repost is represented as a lightweight record linking actor → source content.

### 2. Remix creates a new content identity

A remix creates a new post with:
- `creatorId` = current user
- `sourceContentId` = original content
- `sourceCreatorId` = original creator
- Visible attribution: "Remixed from @creator"

### 3. Feed ranking distinguishes distribution types

- **Original content**: Full score
- **Reposts**: 85% of computed score (social signal, not original work)
- **Remixes**: 95% of computed score (creative derivative)

### 4. Feed normalization carries distribution metadata

Each feed item now includes a `distribution` object:
```js
{
  kind: 'original' | 'repost' | 'remix',
  repostActorId: string | null,
  sourceContentId: string | null,
  sourceCreatorId: string | null,
  sourceCreatorName: string | null,
  sourceCreatorAvatar: string | null,
}
```

### 5. Existing abstractions reused

- `apiClient.js` → HTTP infrastructure
- `postsAPI.repost/unrepost` → Post repost endpoints
- `useEngagement` → Generic engagement pattern (optimistic + revert)
- `socialEventContract` → Telemetry tracking
- `postContract.js` → Post normalization
- `feedTypes.js` → Content type constants
- `feedRanking.js` — Scoring and diversity

### 6. No new abstractions without justification

Each new file has a clear responsibility:
- **Domain**: Business rules that would otherwise scatter across components
- **API**: Backend adapter (not duplicating postApi.js)
- **Hook**: State orchestration (not putting API calls in components)
- **Components**: Pure presentation (each < 60 lines)
