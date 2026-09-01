# J-017 Distribution Backend Contract

## Expected API Endpoints

### POST /api/distribution/share

Record a share event (best-effort, no persistence guarantee).

**Request:**
```json
{
  "sourceType": "post" | "reel" | "jam",
  "sourceId": "string",
  "method": "link" | "native" | "clipboard"
}
```

**Response:** 200 OK (best-effort, failures silently ignored)

---

### POST /api/distribution/repost

Repost content to user's feed.

**Request:**
```json
{
  "sourceType": "post" | "reel" | "jam",
  "sourceId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "repost": {
    "id": "string",
    "actorId": "string",
    "sourceType": "post",
    "sourceContentId": "string",
    "createdAt": "ISO8601"
  },
  "repostCount": 5
}
```

**Fallback:** For posts, the existing `POST /api/posts/:id/engage?type=repost` is used.

---

### DELETE /api/distribution/repost

Undo a repost.

**Request:**
```json
{
  "sourceType": "post" | "reel" | "jam",
  "sourceId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "repostCount": 4
}
```

**Fallback:** For posts, the existing `POST /api/posts/:id/engage?type=unrepost` is used.

---

### POST /api/distribution/remix

Create a remix — a new post derived from existing content.

**Request:**
```json
{
  "sourceType": "post" | "reel",
  "sourceContentId": "string",
  "title": "string (optional)",
  "content": "string",
  "media": "string (optional, URL)"
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "string",
    "title": "string",
    "content": "string",
    "author": { "id": "string", "username": "string" },
    "sourceContentId": "string",
    "sourceCreatorId": "string",
    "isRemix": true,
    "createdAt": "ISO8601"
  }
}
```

---

## Frontend Normalization

### Repost Feed Item
```json
{
  "id": "post_originalId",
  "type": "post",
  "distribution": {
    "kind": "repost",
    "repostActorId": "userId",
    "sourceContentId": "originalId",
    "sourceCreatorId": "originalCreatorId"
  },
  "data": { "/* original post data */" }
}
```

### Remix Feed Item
```json
{
  "id": "post_remixId",
  "type": "post",
  "distribution": {
    "kind": "remix",
    "sourceContentId": "originalId",
    "sourceCreatorId": "originalCreatorId",
    "sourceCreatorName": "originalCreatorUsername"
  },
  "data": { "/* new post data with sourceContentId */" }
}
```

---

## Missing Backend Contracts

The following endpoints need to be implemented on the backend:

1. `POST /api/distribution/share` — Share event tracking
2. `POST /api/distribution/repost` — Generic repost (for non-post content types)
3. `DELETE /api/distribution/repost` — Undo generic repost
4. `POST /api/distribution/remix` — Remix creation

The existing `POST /api/posts/:id/engage?type=repost` and `unrepost` already handle post reposts.
