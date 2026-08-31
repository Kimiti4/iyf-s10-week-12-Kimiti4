/**
 * Notification Grouping
 *
 * Groups related notifications (e.g., multiple likes on the same post).
 *
 * @module domain/notifications/notificationGrouping
 */

/**
 * Group notifications by target + type for display.
 * Recent single notifications stay ungrouped.
 * Older related notifications get grouped.
 */
export function groupNotifications(notifications) {
  if (!notifications || notifications.length === 0) return [];

  const groups = [];
  const seen = new Map();

  for (const n of notifications) {
    const key = `${n.type}_${n.targetId}`;

    if (seen.has(key)) {
      const group = seen.get(key);
      group.count += 1;
      group.actors.push(n.actor);
      // Keep the most recent timestamp
      if (new Date(n.createdAt) > new Date(group.latestCreatedAt)) {
        group.latestCreatedAt = n.createdAt;
        group.latestActor = n.actor;
      }
    } else {
      const group = {
        id: `group_${key}_${n.id}`,
        type: n.type,
        targetType: n.targetType,
        targetId: n.targetId,
        targetTitle: n.targetTitle,
        count: 1,
        actors: [n.actor],
        latestActor: n.actor,
        latestCreatedAt: n.createdAt,
        deepLink: n.deepLink,
        status: n.status,
        isGrouped: false,
      };
      seen.set(key, group);
      groups.push(group);
    }
  }

  // Mark groups with 2+ items as grouped
  return groups.map((g) => ({
    ...g,
    isGrouped: g.count > 1,
    message: formatGroupMessage(g),
  }));
}

function formatGroupMessage(group) {
  if (group.count === 1) {
    return `${group.latestActor.username} — ${group.type.replace(/_/g, ' ')}`;
  }

  const first = group.actors[0]?.username || 'Someone';
  if (group.count === 2) {
    return `${first} and 1 other — ${group.type.replace(/_/g, ' ')}`;
  }
  return `${first} and ${group.count - 1} others — ${group.type.replace(/_/g, ' ')}`;
}
