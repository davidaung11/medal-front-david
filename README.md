# Medalverse Frontend

Next.js frontend for Medalverse (Credential Cloud + Experience Hub).

## Runtime Data Mode

You can switch in the same branch between:

- `APP_DATA_MODE=mock` (no backend dependency)
- `APP_DATA_MODE=api` (proxy/connect to backend via `AUTH_API_BASE_URL`)

Routes that support both modes:

- `/api/auth/login`
- `/api/events`, `/api/events/:id`
- `/api/credentials`, `/api/credentials/:id`
- `/api/event-bookmarks`

## Mock Login

Use this account to sign in:

- Email: `admin@medalverse.io`
- Password: `P@ssword123`

After login, user is redirected to:

- `/credentials-cloud/credentials`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Run Locally

Requirements:

- Node.js 20+
- npm

Install and run (mock):

```bash
make env-local
npm install
npm run dev
```

Available environment templates:

- `environment/.env.local`
- `environment/.env.dev`
- `environment/.env.sit`
- `environment/.env.uat`
- `environment/.env.prod`

Open:

- `http://localhost:3000/login`

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```

Quick mode override without changing `.env`:

```bash
APP_DATA_MODE=mock npm run dev
APP_DATA_MODE=api npm run dev
```

## Makefile

```bash
make help
make env-local
make env-dev
make env-sit
make env-uat
make env-prod
make env-show
make dev
make dev-mock
make dev-api
make build
make build-mock
make build-api
make start
make start-mock
make start-api
make lint
```

Generic env switch:

```bash
make env ENV=dev
```

## Docker

This repo includes:

- `Dockerfile`
- `.dockerignore`

Build and run:

```bash
docker build -t medalverse-frontend .
docker run --rm -p 3000:3000 medalverse-frontend
```

Open:

- `http://localhost:3000`

## Bookmark Behavior (Mock Mode)

- Bookmark toggle on Experience Hub updates local UI immediately
- Bookmarked event IDs are saved in `localStorage` key:
  - `mv_bookmarked_event_ids`
- `Bookmark` tab shows events with `isBookmarked === true`

## Mock Data Notes

- `POST /api/credentials` creates mock credentials in server memory
- Created items are visible immediately in the current running instance
- Restarting the dev server/container resets in-memory created data

## Auth Notes

- App session is maintained with secure cookie from `/api/auth/login`
- `mock` mode uses fixed account:
  - `admin@medalverse.io` / `P@ssword123`
- `api` mode calls backend login at:
  - `AUTH_API_BASE_URL/api/v1/auth/login`

## Key Paths

```text
app/
  api/
    auth/login/route.ts
    auth/logout/route.ts
    credentials/route.ts
    credentials/[id]/route.ts
    events/route.ts
    events/[id]/route.ts
  credentials-cloud/
  experience-hub/
  login/
modules/
  auth/
  credentials/
  experience/
shared/
middleware.ts
```

## Environment

Recommended:

```bash
AUTH_SECRET=replace-with-strong-random-secret
```
