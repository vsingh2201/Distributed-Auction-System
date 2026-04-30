# React Migration Plan

## Current Frontend: What We Have

**9 HTML pages (MPA)** with **10 vanilla JS files**, Bootstrap 5.3.3, and no build tooling. The CSS file is empty — all styling comes from Bootstrap classes.

| Page | JS file | Key behaviour |
|---|---|---|
| `index.html` | `auth.js` | Login → sets `localStorage` session |
| `signup.html` | `auth.js` | Register with address fields |
| `forgot-password.html` | `password.js` | Reset password |
| `catalogue.html` | `catalogue.js` | Keyword search, results table |
| `bid.html` | `auction.js` | Polls auction state every 5 s, countdown timer |
| `upload-item.html` | `auction-item.js` | Creates catalogue item then auction |
| `pay.html` | `pay.js` | Winner-only gate, shipping cost calc |
| `payment.html` | `payment.js` | Card form, submits to payment-service |
| `receipt.html` | `receipt.js` | Fetches and displays receipt |

`api.js` is the shared API client — already cleanly organized by service.

---

## Proposed Structure

New `frontend/` directory at project root:

```
eecs4413-microservices-auction-project/
├── frontend/                   ← new React app lives here
│   ├── src/
│   │   ├── services/api.js     ← direct port of existing api.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         ← shared UI (Navbar, ProtectedRoute, etc.)
│   │   └── pages/              ← one component per route
│   ├── vite.config.js
│   └── package.json
├── api-gateway/                ← unchanged except static/ gets replaced by build output
└── ... (all other services untouched)
```

The Vite build writes to `frontend/dist/`, which gets copied into `api-gateway/src/main/resources/static/` via a script (or `frontend-maven-plugin` in the parent pom). The gateway continues serving static files exactly as today.

---

## Phase 1 — Scaffold & API layer

- `npm create vite@latest frontend -- --template react`
- Port `api.js` → `src/services/api.js` (1:1 translation, no logic changes)
- Add `vite.config.js` dev proxy: all `/user-service`, `/auction-service`, `/catalogue-service`, `/payment-service` calls forward to `http://localhost:9191`
- Add `AuthContext` wrapping `localStorage` (userId, email, userName) — replaces the `setUserSession` / `getUserId` / `requireLogin` helpers

## Phase 2 — Routing & shared components

Use **React Router v6** with `HashRouter` (`/#/catalogue`, `/#/bid`, etc.). Hash routing means the gateway never needs to know about client-side routes — zero changes to the API gateway config.

Shared components to extract (currently copy-pasted into every HTML file):
- `Navbar` — Bootstrap nav with login/logout toggle
- `ProtectedRoute` — wraps any route that requires `userId` in localStorage, redirects to `/` otherwise

## Phase 3 — Port pages (one route at a time)

| Route | Component | Notable React detail |
|---|---|---|
| `/` | `LoginPage` | Form state with `useState` |
| `/signup` | `SignupPage` | Nested address fields |
| `/forgot-password` | `ForgotPasswordPage` | — |
| `/catalogue` | `CataloguePage` | Search results in state |
| `/bid` | `BidPage` | `useEffect` polling every 5 s with `setInterval` + cleanup; countdown timer |
| `/upload-item` | `UploadItemPage` | Two-step create (catalogue then auction) |
| `/pay` | `PayPage` | Winner validation, shipping option toggle |
| `/payment` | `PaymentPage` | Card form, navigate to receipt on success |
| `/receipt` | `ReceiptPage` | Read `paymentId` from URL params |

The `BidPage` is the only page with real complexity — the polling + countdown needs a `useRef` for the interval handle and `useEffect` cleanup to avoid memory leaks.

## Phase 4 — Build integration

Add a `build-frontend` script to the root `pom.xml` (via `exec-maven-plugin` or `frontend-maven-plugin`) so that `mvn clean package -DskipTests` automatically runs `npm run build` and copies `frontend/dist/*` into `api-gateway/src/main/resources/static/`. Docker builds then pick it up transparently.

---

## What stays 100% unchanged

- Every microservice (`auction-service`, `user-service`, `catalogue-service`, `payment-service`, `service-registry`)
- The API gateway routing rules and service discovery config
- All API contracts (URLs, request/response shapes)
- `docker-compose.yml`

---

## Routing Decision

**HashRouter chosen.** Routes use `/#/bid?itemId=1` style — no gateway changes required.
