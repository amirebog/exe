import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// === Email / Contact ===
export async function incrementEmailCount() {
  return await redis.incr("email_count");
}

export async function getEmailCount(): Promise<number> {
  const count = await redis.get<number>("email_count");
  return count || 0;
}

export async function incrementRoleCount(role: string) {
  return await redis.hincrby("role_counts", role, 1);
}

export async function getRoleStats(): Promise<Record<string, number>> {
  return (await redis.hgetall<Record<string, number>>("role_counts")) || {};
}

export interface ContactEntry {
  email: string;
  contact: string;
  role: string;
  timestamp: number;
}

export async function saveContact(
  email: string,
  contact: string,
  role: string
) {
  const entry: ContactEntry = {
    email,
    contact,
    role,
    timestamp: Date.now(),
  };
  await redis.lpush("contacts", JSON.stringify(entry));
  await redis.ltrim("contacts", 0, 999);
}

export async function getContacts(limit: number = 100): Promise<ContactEntry[]> {
  const items = await redis.lrange<string>("contacts", 0, limit - 1);
  return items.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );
}

// === Visit tracking ===
export async function trackVisit(ip: string) {
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const ttl = 7 * 24 * 60 * 60;

  await redis.incr("total_visits");
  await redis.incr(`daily_visits:${today}`);
  await redis.incr(`hourly_visits:${today}:${hour}`);
  await redis.sadd(`unique_visitors:${today}`, ip);

  await redis.expire(`daily_visits:${today}`, ttl);
  await redis.expire(`unique_visitors:${today}`, ttl);
  await redis.expire(`hourly_visits:${today}:${hour}`, ttl);
}

export async function getStats() {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [
    totalVisits,
    todayVisits,
    yesterdayVisits,
    uniqueToday,
    totalEmails,
    roleStats,
  ] = await Promise.all([
    redis.get<number>("total_visits").then((v) => v || 0),
    redis.get<number>(`daily_visits:${today}`).then((v) => v || 0),
    redis.get<number>(`daily_visits:${yesterday}`).then((v) => v || 0),
    redis.scard(`unique_visitors:${today}`),
    getEmailCount(),
    getRoleStats(),
  ]);

  const hourlyData = await getHourlyStats(today);

  return {
    totalVisits,
    todayVisits,
    yesterdayVisits,
    uniqueToday,
    totalEmails,
    roleStats,
    hourlyData,
    today,
  };
}

async function getHourlyStats(today: string): Promise<number[]> {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const promises = hours.map((h) =>
    redis.get<number>(`hourly_visits:${today}:${h}`).then((v) => v || 0)
  );
  return await Promise.all(promises);
}

export async function getTodayEmails(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const contacts = await getContacts(1000);
  return contacts.filter((entry) => {
    const date = new Date(entry.timestamp).toISOString().split("T")[0];
    return date === today;
  }).length;
}

export async function getDailyReport() {
  const stats = await getStats();
  const todayEmails = await getTodayEmails();
  return { ...stats, todayEmails };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "anonymous";
  }
  return req.headers.get("x-real-ip")?.trim() || "anonymous";
}
