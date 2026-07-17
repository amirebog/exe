import { redis } from "@/lib/redis";

export type AdminStep =
  | "photo"
  | "title"
  | "link"
  | "edit_title"
  | "edit_link"
  | "edit_photo";

export interface AdminSession {
  step: AdminStep;
  imageFileId?: string;
  title?: string;
  itemId?: string;
}

const SESSION_TTL = 60 * 30;

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
