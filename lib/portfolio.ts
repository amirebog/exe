import { redis } from "@/lib/redis";

export interface PortfolioItem {
  id: string;
  title: string;
  link: string;
  imageFileId: string;
  createdAt: number;
}

const PORTFOLIO_KEY = "portfolio:items";

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await redis.lrange<PortfolioItem>(PORTFOLIO_KEY, 0, -1);
  if (!items || items.length === 0) return [];

  return items
    .map((item) => (typeof item === "string" ? JSON.parse(item) : item))
    .sort((a, b) => b.createdAt - a.createdAt);
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

  await redis.del(PORTFOLIO_KEY);
  if (filtered.length > 0) {
    await redis.rpush(
      PORTFOLIO_KEY,
      ...filtered.map((item) => JSON.stringify(item))
    );
  }

  return true;
}

export async function getPortfolioItemById(
  id: string
): Promise<PortfolioItem | null> {
  const items = await getPortfolioItems();
  return items.find((item) => item.id === id) ?? null;
}
