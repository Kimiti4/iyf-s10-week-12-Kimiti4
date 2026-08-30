# Jam Domain Architecture

> **J-001 Deliverable** — Defines the Jam entity model, API contract, and database schema.

---

## Overview

A **Jam** is a creator-led content primitive that turns an audience from viewers into participants. It is the signature interaction of JamiiLink.

Unlike a post (consume → react) or a reel (watch → react/remix), a Jam follows:

```
Jam → Discover → Participate → Contribute → Interact → Collaborate → Outcome
```

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │──────▶│      jams        │──────▶│ jam_participations│
│              │       │                  │       │                  │
│  id (PK)     │       │  id (PK)         │       │  id (PK)         │
│  username    │       │  creator_id (FK) │       │  jam_id (FK)     │
│  email       │       │  title           │       │  user_id (FK)    │
│  avatar_url  │       │  description     │       │  joined_at       │
│              │       │  cover_media_url │       │  is_host         │
│              │       │  prompt          │       └────────┬─────────┘
│              │       │  status          │                │
│              │       │  participation_  │                │
│              │       │    types (JSONB) │                ▼
│              │       │  category        │       ┌──────────────────┐
│              │       │  location (JSONB)│       │ jam_contributions │
│              │       │  deadline        │       │                  │
│              │       │  participant_cnt │       │  id (PK)         │
│              │       │  contribution_cnt│       │  jam_id (FK)     │
│              │       │  tags (TEXT[])   │       │  participation_id│
│              │       │  metadata (JSONB)│       │  user_id (FK)    │
│              │       │  created_at      │       │  type            │
│              │       │  updated_at      │       │  content_url     │
│              │       └──────────────────┘       │  text_content    │
│              │                                  │  location (JSONB)│
│              │                                  │  status          │
│              │                                  │  vote_count      │
│              │                                  │  created_at      │
│              │                                  └────────┬─────────┘
│              │                                           │
│              │                                           ▼
│              │                                  ┌──────────────────┐
│              │                                  │  jam_reactions    │
│              │                                  │                  │
│              │                                  │  id (PK)         │
│              │                                  │  contribution_id │
│              │                                  │  user_id (FK)    │
│              │                                  │  type            │
│              │                                  │  created_at      │
│              │                                  └──────────────────┘
└─────────────┘
```

---

## Entity Definitions

### Jam

The core entity. A Jam is always owned by one creator and can have many participants and contributions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `creator_id` | UUID | FK → users.id (the host) |
| `title` | VARCHAR(120) | Jam title |
| `description` | TEXT | Detailed description |
| `cover_media_url` | TEXT | Hero image or video |
| `prompt` | VARCHAR(500) | Call-to-action text |
| `status` | VARCHAR(20) | Lifecycle state |
| `participation_types` | JSONB | Accepted contribution types |
| `category` | VARCHAR(50) | Discovery category |
| `location` | JSONB | { lat, lng, name, county } |
| `deadline` | TIMESTAMPTZ | When the Jam ends |
| `participant_count` | INTEGER | Denormalized count |
| `contribution_count` | INTEGER | Denormalized count |
| `tags` | TEXT[] | Searchable tags |
| `metadata` | JSONB | Extensible key-value store |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Jam Participation

A user's intent to participate in a Jam. One participation per user per Jam.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `jam_id` | UUID | FK → jams.id |
| `user_id` | UUID | FK → users.id |
| `joined_at` | TIMESTAMPTZ | When they joined |
| `is_host` | BOOLEAN | Whether this is the creator |

### Jam Contribution

An actual submission within a Jam. One user can have multiple contributions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `jam_id` | UUID | FK → jams.id |
| `participation_id` | UUID | FK → jam_participations.id |
| `user_id` | UUID | FK → users.id |
| `type` | VARCHAR(20) | video/image/post/poll/location/skill/gig |
| `content_url` | TEXT | URL to the contributed media |
| `text_content` | TEXT | Accompanying text |
| `location` | JSONB | { lat, lng, name } |
| `status` | VARCHAR(20) | pending/approved/rejected/featured |
| `vote_count` | INTEGER | Denormalized vote count |
| `created_at` | TIMESTAMPTZ | Submission timestamp |

### Jam Reaction

A vote or reaction on a contribution.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `contribution_id` | UUID | FK → jam_contributions.id |
| `user_id` | UUID | FK → users.id |
| `type` | VARCHAR(20) | upvote/downvote/fire/clap/love |
| `created_at` | TIMESTAMPTZ | Reaction timestamp |

---

## Jam Status Lifecycle

```
draft ──▶ scheduled ──▶ active ──▶ ended ──▶ archived
  ▲            │
  └────────────┘
```

| Status | Description | Accepts Contributions |
|--------|-------------|----------------------|
| `draft` | Being configured by creator | No |
| `scheduled` | Published but not yet active | No |
| `active` | Open for participation | Yes |
| `ended` | Deadline passed or creator ended | No |
| `archived` | Hidden from discovery | No |

---

## API Contract

### Jams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jams` | List active Jams (discovery feed) |
| GET | `/api/jams/:id` | Get a single Jam |
| POST | `/api/jams` | Create a new Jam |
| PUT | `/api/jams/:id` | Update a Jam (host only) |
| DELETE | `/api/jams/:id` | Delete a Jam (host only) |
| POST | `/api/jams/:id/transition` | Change Jam status |
| GET | `/api/jams/creator/:userId` | Jams by a creator |
| GET | `/api/jams/mine` | Current user's Jams |
| GET | `/api/jams/search?q=` | Search Jams |
| GET | `/api/jams/trending` | Trending Jams |

### Participation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jams/:id/participants` | Join a Jam |
| DELETE | `/api/jams/:id/participants` | Leave a Jam |
| GET | `/api/jams/:id/participants` | List participants |
| GET | `/api/jams/:id/participants/me` | Check membership |

### Contributions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jams/:id/contributions` | Submit a contribution |
| GET | `/api/jams/:id/contributions` | List contributions |
| GET | `/api/jams/:id/contributions/mine` | My contributions |
| DELETE | `/api/jams/:id/contributions/:cid` | Delete contribution |
| POST | `/api/jams/:id/contributions/:cid/feature` | Feature contribution |

### Reactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contributions/:id/reactions` | React to contribution |
| DELETE | `/api/contributions/:id/reactions` | Remove reaction |
| GET | `/api/contributions/:id/reactions` | Get reactions |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jams/:id/leaderboard` | Get leaderboard |
| GET | `/api/jams/:id/leaderboard/me` | My position |

---

## Events

The Jam engine emits events that other systems can subscribe to:

| Event | Payload | Description |
|-------|---------|-------------|
| `jam:created` | `{ jamId, creatorId }` | Jam was created |
| `jam:started` | `{ jamId }` | Jam became active |
| `jam:ended` | `{ jamId }` | Jam ended |
| `jam:archived` | `{ jamId }` | Jam was archived |
| `jam:participant:joined` | `{ jamId, userId }` | User joined |
| `jam:participant:left` | `{ jamId, userId }` | User left |
| `jam:contribution:created` | `{ jamId, contributionId, userId, type }` | Contribution submitted |
| `jam:contribution:featured` | `{ jamId, contributionId }` | Contribution featured |
| `jam:contribution:rejected` | `{ jamId, contributionId, reason }` | Contribution rejected |
| `jam:reaction:added` | `{ contributionId, userId, type }` | Reaction added |
| `jam:reaction:removed` | `{ contributionId, userId }` | Reaction removed |

---

## Files

| File | Purpose |
|------|---------|
| `src/models/jam.js` | Domain types, constants, helper functions |
| `src/services/jamApi.js` | API service layer (HTTP client) |
| `db/migrations/001_create_jam_tables.sql` | Database schema |
| `docs/architecture/jam-domain.md` | This document |
