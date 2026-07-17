import { redis } from "@/lib/redis";

export interface PortfolioItem {
  id: string;
  title: string;
  link: string;
  imageFileId: string;
  createdAt: number;
}

const PORTFOLIO_KEY = "portfolio:items";

function parseItem(item: PortfolioItem | string): PortfolioItem {
  return typeof item === "string" ? JSON.parse(item) : item;
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await redis.lrange<PortfolioItem | string>(PORTFOLIO_KEY, 0, -1);
  if (!items || items.length === 0) return [];
  return items.map(parseItem).sort((a, b) => b.createdAt - a.createdAt);
}

async function saveAllItems(items: PortfolioItem[]) {
  await redis.del(PORTFOLIO_KEY);
  if (items.length > 0) {
    await redis.rpush(
      PORTFOLIO_KEY,
      ...items.map((item) => JSON.stringify(item))
    );
  }
}

export async function addPortfolioItem(
  item: Omit<PortfolioItem, "id" | "createdAt">
): Promise<PortfolioItem> {
  const entry: PortfolioItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await redis.lpush(PORTFOLIO_KEY, JSON.stringify(entry));
  return entry;
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const items = await getPortfolioItems();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  await saveAllItems(filtered);
  return true;
}

export async function updatePortfolioItem(
  id: string,
  patch: Partial<Pick<PortfolioItem, "title" | "link" | "imageFileId">>
): Promise<PortfolioItem | null> {
  const items = await getPortfolioItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...patch };
  await saveAllItems(items);
  return items[index];
}

export async function getPortfolioItemById(
  id: string
): Promise<PortfolioItem | null> {
  const items = await getPortfolioItems();
  return items.find((item) => item.id === id) ?? null;
}

export async function getPortfolioItemByIndex(
  index: number
): Promise<PortfolioItem | null> {
  const items = await getPortfolioItems();
  return items[index] ?? null;
}
