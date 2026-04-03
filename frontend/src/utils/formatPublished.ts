export function formatPublished(createdAt?: string): string {
  if (!createdAt) return 'Published recently';
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return 'Published recently';
  const hours = Math.floor((Date.now() - then) / 3600000);
  if (hours < 1) return 'Published: just now';
  if (hours < 24) return `Published: ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Published: ${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  return `Published: ${weeks} week${weeks === 1 ? '' : 's'} ago`;
}
