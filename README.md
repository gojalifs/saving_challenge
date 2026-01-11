This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Saving Challenge Features

- 52-week savings grid with optimistic client updates and celebratory confetti when a week is marked as saved.
- Weekend reminder notification that appears on Friday, Saturday, and Sunday (once per day) if the current week has not been checked off yet. The reminder uses a `localStorage` key (`savingChallenge:lastReminderDate`) so you can clear it manually for testing.
- Browser push notifications (via Web Push + service worker) that deliver the same weekend reminder even when the tab is closed, as long as the user has opted in.
- Google OAuth and email/password authentication powered by Better Auth with Drizzle.

### Verifying the weekend reminder

1. Start the dev server (`pnpm dev`).
2. Use DevTools to run `localStorage.removeItem('savingChallenge:lastReminderDate')` so the reminder can fire again.
3. Temporarily change your system date (or override `Date` via DevTools) to Friday, Saturday, or Sunday.
4. Refresh the dashboard without checking the current week. A toast reading *“Belum cek tantangan minggu ini? Jangan lupa setor tabunganmu.”* should appear once.
5. Mark the current week as saved and refresh—the reminder should no longer display.

### Enabling push notifications (Web Push)

1. Generate VAPID keys once: `npx web-push generate-vapid-keys`.
2. Copy the public key into both `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PUBLIC_KEY` in `.env`. Copy the private key into `WEB_PUSH_PRIVATE_KEY`. Provide a contact email via `WEB_PUSH_CONTACT_EMAIL` and set `REMINDER_SECRET` to a long random string. Restart `pnpm dev` after changing env vars.
3. Visit the dashboard and click **Aktifkan Notifikasi Akhir Pekan**. Accept the browser permission prompt.
4. Trigger the reminder endpoint manually to test delivery:

```bash
curl -X POST http://localhost:3000/api/notifications/remind \
	-H "x-reminder-key: $REMINDER_SECRET"
```

Only users who (a) enabled push and (b) have not marked the current week as saved will receive messages. Each subscription receives at most one notification per day.

> Deploy note: schedule the same POST request with a cron (e.g., Vercel Cron) for Friday–Sunday.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
