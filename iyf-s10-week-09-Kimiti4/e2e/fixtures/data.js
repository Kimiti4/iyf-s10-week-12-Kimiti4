let counter = 0;
function uid(prefix = 'e2e') {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

export function makeUser(overrides = {}) {
  const id = uid('usr');
  return {
    id,
    username: `user_${id}`,
    email: `user_${id}@jamii.link`,
    role: 'user',
    avatar: '/avatars/default.png',
    bio: `Bio for ${id}`,
    ...overrides,
  };
}

export function makePost(overrides = {}) {
  const id = uid('post');
  return {
    _id: id,
    id,
    content: `Test post ${id}`,
    author: makeUser(),
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    media: null,
    ...overrides,
  };
}

export function makeJam(overrides = {}) {
  const id = uid('jam');
  return {
    _id: id,
    id,
    title: `Jam ${id}`,
    description: `Description for jam ${id}`,
    host: makeUser(),
    participants: [],
    maxParticipants: 20,
    status: 'active',
    goal: 'Collaborative creation',
    progress: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeAlert(overrides = {}) {
  const id = uid('alert');
  return {
    _id: id,
    id,
    title: `Alert ${id}`,
    description: `Alert description ${id}`,
    severity: 'info',
    source: 'System',
    location: 'Nairobi',
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeReel(overrides = {}) {
  const id = uid('reel');
  return {
    _id: id,
    id,
    title: `Reel ${id}`,
    videoUrl: `/videos/${id}.mp4`,
    thumbnailUrl: `/thumbnails/${id}.jpg`,
    author: makeUser(),
    likes: 0,
    comments: 0,
    views: 0,
    duration: 30,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeNotification(overrides = {}) {
  const id = uid('notif');
  return {
    _id: id,
    id,
    type: 'like',
    message: `Notification ${id}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeComment(overrides = {}) {
  const id = uid('comment');
  return {
    _id: id,
    id,
    text: `Comment ${id}`,
    author: makeUser(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeDiscoveryItem(overrides = {}) {
  const id = uid('disc');
  return {
    _id: id,
    id,
    type: 'trending',
    title: `Discovery ${id}`,
    description: `Trending topic ${id}`,
    count: Math.floor(Math.random() * 1000),
    ...overrides,
  };
}
