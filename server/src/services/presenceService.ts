// In-memory presence registry for users who currently hold a valid client JWT.
// Map preserves insertion order, so the most recently-registered user is last.
type Presence = { expiresAt: number; busyUntil: number };

const onlineUsers = new Map<string, Presence>();

const nowSec = (): number => Math.floor(Date.now() / 1000);

export function setUserOnline(userId: string, ttlSeconds: number): void {
  const expiresAt = nowSec() + ttlSeconds;
  const busyUntil = onlineUsers.get(userId)?.busyUntil ?? 0;
  // Delete+set so the user moves to the end of the insertion order.
  onlineUsers.delete(userId);
  onlineUsers.set(userId, { expiresAt, busyUntil });
}

export function setUserOffline(userId: string): void {
  onlineUsers.delete(userId);
}

export function isUserOnline(userId: string): boolean {
  const p = onlineUsers.get(userId);
  if (!p) return false;
  if (p.expiresAt <= nowSec()) {
    onlineUsers.delete(userId);
    return false;
  }
  return true;
}

export function setUserBusy(userId: string, busyTtlSeconds: number): void {
  const p = onlineUsers.get(userId);
  if (!p) return;
  p.busyUntil = nowSec() + busyTtlSeconds;
}

export function setUserFree(userId: string): void {
  const p = onlineUsers.get(userId);
  if (!p) return;
  p.busyUntil = 0;
}

export function isUserBusy(userId: string): boolean {
  const p = onlineUsers.get(userId);
  if (!p) return false;
  return p.busyUntil > nowSec();
}

export function getOnlineUsers(): string[] {
  const now = nowSec();
  const live: string[] = [];
  for (const [userId, p] of onlineUsers) {
    if (p.expiresAt > now) live.push(userId);
    else onlineUsers.delete(userId);
  }
  return live;
}

export function getLatestOnlineUser(): string | undefined {
  const users = getOnlineUsers();
  return users.length ? users[users.length - 1] : undefined;
}

export function getFirstFreeUser(): string | undefined {
  const now = nowSec();
  for (const [userId, p] of onlineUsers) {
    if (p.expiresAt <= now) {
      onlineUsers.delete(userId);
      continue;
    }
    if (p.busyUntil <= now) return userId;
  }
  return undefined;
}
