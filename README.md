# Nobokothon Author Portal

React (Vite) + Tailwind CSS v4 author panel for Nobokothon. JavaScript only.
It talks to the POS (Nobo_Pos_Next) API with the author's Bearer token (`writer_token`).

## Setup

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to the POS origin
npm run dev               # http://localhost:5173
npm run build             # production files in dist/
```

| Variable | Meaning |
| --- | --- |
| `VITE_API_BASE_URL` | POS origin, no trailing slash (the app calls `/api/v1/...`) |
| `VITE_IMAGE_BASE_URL` | Image host (same as POS `NEXT_PUBLIC_IMAGE_BASE_URL`); covers `/book/<file>`, photos `/author/<file>` |
| `VITE_SITE_URL` | Public website link used by "Share with readers" |

POS side: set `NEXT_PUBLIC_AUTHORS_BASE_URL` to this portal's URL (used for CORS, the password links in emails and the e-commerce CORS check).
The SPA needs a fallback to `index.html` for all paths (Netlify `_redirects`, Vercel rewrites, or nginx `try_files $uri /index.html`).

## Screens

| Route | Screen |
| --- | --- |
| `/login`, `/forgot-password` | Sign in, reset link request |
| `/reset-password?token=` | Onboarding 1 · Set password (link from the invite / reset email) |
| `/welcome` | Onboarding 2–7 · Photo → Personal → Payment → About you → Review → Done |
| `/` | Dashboard (sales cards, balances, advance recovery, recent sales, royalty donut and chart, received, updates) |
| `/books`, `/books/:id` | My Books, Book details |
| `/sales` | Sales History (invoice lines with your royalty) |
| `/royalty-history` | Ledger: royalty, advance, adjustment, withdraw, recovery with running balance |
| `/withdraw` | Withdraw (open / below minimum / no pay method / advance running / submitted) |
| `/withdraw-history` | Withdraw history with receipts and cancel |
| `/pay-method` | bKash, Nagad, Rocket, bank — add, edit, delete, default |
| `/profile` | Photo, personal info, about you (saved to the website profile) |
| `/notifications` | Own notifications, mark read |

Popups (shown once per item, stored in `localStorage`): advance given, withdraw paid, withdraw cancelled by Nobokothon, new edition, sales milestone (100/250/500/1000… copies).

## APIs used (POS)

- `POST /api/v1/auth/author-login`, `/auth/forgot-password` (`account: "author"`), `/auth/reset-password`
- `GET /api/v1/auth/author-profile` (pay methods), `POST /author-payment-info/add`, `PUT /edit/:id`, `DELETE /delete/:id`
- `GET|PUT|POST /api/v1/author/self-profile` (proxy to the e-commerce profile)
- `/api/v1/author-panel/*`: `summary`, `books`, `books/:id`, `sales`, `history`, `payouts` (GET/POST), `payouts/:id`, `payouts/:id/cancel`, `notifications` (GET/PATCH), `onboarding` (GET/POST), `payment-methods/:id/default`

## Money rules (same as POS admin)

- Earned = royalty + added adjustments; Received = advances + paid withdraws + deducted adjustments; Pending = requested withdraws
- Available = Earned − Received − Pending (negative means advance still running)
- Withdraw: amount ≥ ৳500 and ≤ Available, one open request at a time; the author can cancel an open request.
