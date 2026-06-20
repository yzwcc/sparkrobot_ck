# Warehouse Robot Management System

This is a Next.js + TypeScript warehouse management app for robots.

## Features

- Robot registry with unique SN
- Stock in / stock out operations
- Warehouse assignment
- Order status tracking
- Warehouse overview cards and recent history
- Activity records with filters

## Local run

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Start PostgreSQL:
   - `docker compose up -d`
5. Create Prisma migration and seed data:
   - `npm run prisma:generate`
   - `npx prisma migrate dev --name init`
   - `npm run prisma:seed`
6. Start the app:
   - `npm run dev`

## Deploy to Vercel

1. Push this repository to GitHub.
2. Create a PostgreSQL database on a hosted provider.
3. In Vercel, import the GitHub repo.
4. Set `DATABASE_URL` in Vercel project settings.
5. Deploy.

## Defaults

- Default admin username: `admin`
- Default admin password: `admin123`
