# Christmas Wishes

Two-phase wishes site (send/receive) with a backend-controlled jump time.

## Local Dev

1. Install deps
   ```bash
   npm install
   ```
2. Set env vars (example in `.env.example`)
3. Start server
   ```bash
   npm start
   ```

The server auto-creates Postgres tables on startup.

## Deploy to Railway (GitHub)

1. Push this repo to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Add a Postgres database to the project.
4. In your service variables, ensure `DATABASE_URL` is set (Railway auto-wires it when you attach Postgres).
5. (Optional) Set `CHRISTMAS_TIME` and `DEV_MODE` in Railway variables.
6. Deploy. The start command is `npm start` (configured in `railway.json`).

## Jump Time API

- Set jump time:
  ```bash
  curl -X POST https://YOUR_DOMAIN/api/jump-time \
    -H 'Content-Type: application/json' \
    -d '{"jumpTime":"2024-12-01T12:00:00+08:00"}'
  ```
- Clear override (use default `CHRISTMAS_TIME`):
  ```bash
  curl -X POST https://YOUR_DOMAIN/api/jump-time \
    -H 'Content-Type: application/json' \
    -d '{"jumpTime":null}'
  ```
