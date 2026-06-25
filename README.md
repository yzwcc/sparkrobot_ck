# Warehouse Robot Management System

This is a Next.js + TypeScript warehouse management app for robots.

## Features

- Robot registry with unique SN
- Stock in / stock out operations
- Warehouse assignment
- Order status tracking
- Warehouse overview cards and recent history
- Activity records with filters

## Why some functions fail

The project uses Prisma with PostgreSQL.

- Read-only pages can still render because the app falls back to demo snapshot data when database reads fail.
- Real functions such as login, create robot, stock in/out, and warehouse management require a working database.
- Prisma migration commands require both `DATABASE_URL` and `DIRECT_URL`.
- If `DIRECT_URL` is missing, Prisma commands fail immediately.
- If PostgreSQL is not running, API writes and login will fail even if pages still open.
- On Vercel/Neon, the platform may provide `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`; the project now maps those automatically.

## Local run

1. Install Node.js 20+.
2. Install PostgreSQL locally, or install Docker Desktop if you want to use `docker compose`.
3. Copy `.env.example` to `.env.local`.
4. Set either:
   - `DATABASE_URL` and `DIRECT_URL`, or
   - `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
5. Start PostgreSQL.
   - With Docker: `docker compose up -d`
   - Without Docker: create a `warehouse_robot` database in your local PostgreSQL service
6. Run `npm install`.
7. Run `npx prisma migrate deploy`.
8. Run `npm run prisma:seed`.
9. Start the app with `npm run dev`.

## Deploy with GitHub + Vercel

1. Push this repository to GitHub.
2. Create a hosted PostgreSQL database, for example Neon, Supabase, or Railway.
3. In GitHub, keep application secrets out of the repo. Do not commit `.env.local`.
4. In Vercel, import the GitHub repository.
5. Set these environment variables in Vercel:
   - `DATABASE_URL`: pooled or standard runtime connection string
   - `DIRECT_URL`: non-pooled direct connection string for Prisma migrations
   - Or let Vercel Postgres / Neon inject `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
6. Deploy.
7. After the first deploy, run `npx prisma migrate deploy` against the production database if your platform does not run it automatically.

## Defaults

- Default admin username: `zhangyan`
- Default admin password: `sparkrobot`
