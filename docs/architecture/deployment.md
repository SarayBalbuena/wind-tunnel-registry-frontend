# Deployment (Vercel)

The app is a static Vite build served by Vercel. `vercel.json` defines the build and two rewrites:

| Path | Goes to | Why |
| --- | --- | --- |
| `/api/*` | the backend on Koyeb (path without `/api`) | the browser only talks to one domain |
| everything else | `/index.html` | client-side routes (`/dashboard`) survive a reload |

## Why the `/api` proxy

The backend sets a `SameSite=None` session cookie. If the frontend called the Koyeb domain directly, that cookie would be a third-party cookie, which Safari blocks and other browsers are phasing out. Going through the same domain makes it first-party, and no CORS entry is needed for the Vercel domain.

## Settings

**Vercel** (Production and Preview):

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `/api` (not the full backend URL) |
| `VITE_OTEL_*` | optional, same as local |

**Backend on Koyeb:**

| Variable | Value |
| --- | --- |
| `FRONTEND_URL` | `https://<app>.vercel.app` |
| `GOOGLE_CALLBACK_URL` | `https://<app>.vercel.app/api/auth/google/callback` |
| `MAGIC_LINK_CALLBACK_URL` | `https://<app>.vercel.app/api/auth/magic-link/callback` |

`MAGIC_LINK_CALLBACK_URL` must go through the Vercel domain too. If it points at Koyeb directly, the session cookie is set on the Koyeb host and `/api/auth/session` returns 401 right after clicking the emailed link.

**Google Cloud Console:** add the same callback URL under "Authorized redirect URIs" of the OAuth client.

## Notes

- Google login only works on domains whose callback URL is registered. Preview deployments (one per PR) get their own URL, so they cannot log in unless that URL is added too.
- If the backend URL changes, update the `destination` of the `/api` rewrite in `vercel.json`.
- Deploy from the terminal with `npx vercel --prod`, or connect the GitHub repo in Vercel for automatic deploys on `main`.
