# Zyrix

Modern portfolio landing page built with Next.js 16, Redis (Upstash), and Telegram bot integration.

**Live:** https://zyrixx.vercel.app

## Features

- Portfolio section managed via Telegram bot
- Contact form with rate limiting and anti-spam
- Visit tracking and daily Telegram reports
- Dark / light theme
- SEO optimized (sitemap, robots, manifest)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Upstash Redis
- Grammy (Telegram Bot)

## Setup

```bash
pnpm install
cp .env.example .env
# Fill in your environment variables
pnpm dev
```

## Environment Variables

See `.env.example` for all required variables:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
- `CRON_SECRET` (for daily reports on Vercel)
- `SITE_URL` (for webhook setup)

Optional:

- `STATS_SECRET` (protects full stats API)
- `TELEGRAM_WEBHOOK_SECRET`

## Telegram Bot — Portfolio Management

After deploying, set the webhook:

```bash
pnpm webhook:set
```

Then open your bot in Telegram and use these commands:

| Command | Description |
|---------|-------------|
| `/addwork` | Add a portfolio item (photo → title → link) |
| `/listworks` | List all portfolio items with IDs |
| `/deletework <id>` | Delete a portfolio item |
| `/stats` | Live site statistics |
| `/contacts` | Last 5 contacts from the form |
| `/report` | Send daily report now |
| `/cancel` | Cancel current action |

Only the admin (`TELEGRAM_CHAT_ID`) can use these commands.

## Deploy on Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Run `pnpm webhook:set` to connect the Telegram bot

Daily reports run automatically via Vercel Cron at 8:00 UTC.

## Project Structure

```
app/
  api/
    portfolio/       # Public portfolio API
    send-email/      # Contact form
    stats/           # Analytics
    track/           # Visit tracking
    telegram/webhook # Bot webhook
    cron/daily-report
components/
  work-samples.tsx # Portfolio grid
  email-card.tsx   # Contact form
lib/
  portfolio.ts     # Redis portfolio storage
  telegram-bot.ts  # Bot commands
```

## Author

**Amir** — Zyrix Studio
