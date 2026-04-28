# Local Development

## Prerequisites

- Node.js
- Docker (for local Supabase)
- Supabase CLI (`npm install supabase --save-dev` or global install)

## First-time setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the example env file and fill in your local values (already done if `.env.local` exists):
   ```
   cp .env.example .env.local
   ```
   The local Supabase URL and anon key are printed by `make db-start` — see below.

## Running locally

Start the local Supabase instance (requires Docker):
```
make db-start
```

Apply database migrations:
```
make db-up
```

Start the dev server:
```
make run
```

The app is now at `http://localhost:3000` and talks to the local Supabase at `http://127.0.0.1:54321`.

## Emails

Emails (magic links, confirmations) are caught locally by Mailpit — they never reach a real inbox.

Open the local email inbox:
```
make db-mail
```

This opens `http://127.0.0.1:54324`.

## Local vs production

| Command | Connects to |
|---|---|
| `make run` | Local Supabase (Docker) |
| `make start` | Production Supabase |

`make start` runs the production server and loads `.env.production.local`, which points to the real Supabase project. Use it only to preview a production build — not for development.

## Other commands

| Command | Description |
|---|---|
| `make test` | Run tests |
| `make lint` | Run ESLint |
| `make build` | Build for production |
| `make db-stop` | Stop local Supabase |
| `make db-reset` | Wipe and recreate local DB from scratch |
| `make db-studio` | Open local Supabase Studio (table editor, SQL runner) |
| `make db-push` | Push migrations to the remote (production) DB |
