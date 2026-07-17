import { redis } from "@/lib/redis";

export type AdminStep = "photo" | "title" | "link";

export interface AdminSession {
  step: AdminStep;
  imageFileId?: string;
  title?: string;
}

const SESSION_TTL = 60 * 30; // 30 minutes

function sessionKey(chatId: number | string) {
  return `admin:session:${chatId}`;
}

export async function getAdminSession(
  chatId: number | string
): Promise<AdminSession | null> {
  const data = await redis.get<AdminSession>(sessionKey(chatId));
  return data ?? null;
}

export async function setAdminSession(
  chatId: number | string,
  session: AdminSession
): Promise<void> {
  await redis.set(sessionKey(chatId), session, { ex: SESSION_TTL });
}

export async function clearAdminSession(chatId: number | string): Promise<void> {
  await redis.del(sessionKey(chatId));
}
