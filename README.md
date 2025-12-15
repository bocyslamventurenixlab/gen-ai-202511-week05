# Google API Backend (Node.js)

This project is a minimal Node.js backend and simple frontend to test Google APIs (Gmail, Google Docs, Google Sheets).

Quick setup

1. Copy `.env.sample` to `.env` and fill `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI` (default: `http://localhost:3000/oauth2callback`). Go to the TERMINAL tab.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Go to the PORTS Tab and choose Open in your browser. Now you have the URL like https://laughing-enigma-69qvj46qprwvfrg9w-3000.app.github.dev/ for your service.

5. Change the REDIRECT_URI to start with this URL
e.g. REDIRECT_URI=https://laughing-enigma-69qvj46qprwvfrg9w-3000.app.github.dev/oauth2callback

How to obtain a refresh token

1. Click "Start OAuth flow" on the frontend (or open `/api/auth`) and complete consent.
2. The callback displays an object containing a `refresh_token`. Copy that value into your `.env` as `REFRESH_TOKEN=`.
3. Go back to TERMINAL, use "CTRL-C" to stop the server and run npm start to start the server again.

Endpoints

- `GET /api/auth` — redirects to Google OAuth consent screen.
- `GET /oauth2callback` — OAuth callback; responds with tokens (use `refresh_token` in `.env`).
- `GET /api/gmail?q=...` — fetch recent Gmail messages matching `q`.
- `GET /api/docs?q=...` — search Google Docs (uses Drive `fullText contains`) for `q`.
- `GET /api/sheets?q=...` — search spreadsheets and return a small sample of values.

Notes

- This example expects a user-owned OAuth2 flow (not a service account). Gmail access requires explicit user consent.
- Keep your `.env` out of version control.
# gen-ai-202511-week05
The example code for Gen AI 202511 Week05
