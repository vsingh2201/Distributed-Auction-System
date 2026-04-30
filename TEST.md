# End-to-End Test Guide

Tests the full React frontend against the live Spring Boot backend via Docker Compose.

## Prerequisites

1. All six Docker containers are running:
   ```bash
   docker compose up
   ```
2. React dev server is running:
   ```bash
   cd frontend && npm run dev
   ```
3. Open **`http://localhost:5173`** in your browser.

> The Vite dev server proxies all API calls through the gateway at `http://localhost:9191`,
> so no CORS issues and no need to change any URLs.

---

## Step 1 — Register a New User

You should land on the login page (unauthenticated users are redirected here automatically).
Click **"Create a new account"**.

Fill in:

| Field         | Example value  |
|---------------|----------------|
| Email         | `test@auction.com` |
| Password      | `test123`      |
| First name    | `Test`         |
| Last name     | `User`         |
| Street Name   | `Main St`      |
| Street Number | `100`          |
| City          | `Toronto`      |
| Country       | `Canada`       |
| Postal Code   | `M1A 1A1`      |

Click **Create Account**.

✅ Expected: green "Account created! Redirecting to login…" banner, then auto-redirect to the login page.

**Watch for:** A red error banner usually means the email is already taken or the user-service
is down. Try a different email, or check container health with `docker logs user-service`.

---

## Step 2 — Login

Enter the credentials you just registered with and click **Sign In**.

✅ Expected: redirect to `/catalogue`. The navbar shows your name and email in the
top-right, with **Catalogue** and **Upload Item** buttons.

**Watch for:** "Invalid email or password" means registration didn't persist — check
`docker logs user-service`.

---

## Step 3 — Browse the Catalogue

Type `wireless` in the search box and click **Search** (or press Enter).

✅ Expected:
- Rows appear for Wireless Mouse, Wireless Keyboard, Noise Cancelling Headphones.
- **Price** column shows a dollar amount (from `startPrice`).
- **Ends At** column shows a readable date string like `2025-12-05T17:00:00` — not
  comma-separated numbers like `2025,12,5,17,0,0`.
- Each row has a **Bid** button that navigates to `/bid?itemId=N`.

Also try searching `laptop` and a nonsense term to verify the zero-results state.

**Flag if:** Ends At shows comma-separated numbers → the Jackson timestamp fix
(`write-dates-as-timestamps=false`) didn't make it into the running image; rebuild with
`mvn clean package -DskipTests` and `docker compose build`.

---

## Step 4 — Upload an Auction Item

Click **Upload Item** in the navbar.

Fill in:

| Field        | Value                    |
|--------------|--------------------------|
| Item name    | `Test Lamp`              |
| Description  | `vintage,lamp,decor`     |
| Duration     | `1` (minute)             |
| Starting bid | `10`                     |

Use a 1-minute duration so the auction closes quickly and you can test payment in the same session.

Click **Create auction item**.

✅ Expected: green "Auction created! Item ID: 9" (or the next available ID). **Note the Item ID.**

**Watch for:**
- Red error → the `sellerId` / `startTime` NOT NULL constraint fix may not be in the
  running image. Rebuild: `mvn clean package -DskipTests && docker compose build && docker compose up`.
- "Auction already exists for item X" → item was created but the auction call was retried;
  note the ID from the banner and continue.

---

## Step 5 — Place a Bid

Navigate to: **`http://localhost:5173/#/bid?itemId=<YOUR_ITEM_ID>`**

✅ Expected:
- **Current Price** shows `$10`.
- **Time Remaining** counts down (e.g. `"Ends in 0m 58s"`), not `"Auction ended"`.
- Bid form is visible.

Enter `15` in the bid field and click **Place Bid**.

✅ Expected: green "Bid placed successfully!" flash, Current Price updates to `$15`.

Try entering `5` (below the current price) — ✅ Expected: red error
"Bid must be strictly higher than the current price (15)."

**Wait ~90 seconds.** The `AuctionClosingScheduler` polls every 30 seconds, so once the
1-minute timer expires the auction closes within half a minute. The page auto-polls every
5 seconds — the bid form disappears and a **"You won! Pay Now →"** button appears.

**Flag if:**
- Countdown immediately shows `"Auction ended"` on load → Jackson `Instant` fix not in
  the running image (same rebuild as above).
- "You won!" button never appears → open DevTools → Application → Local Storage and
  confirm `userId` matches the `highestBidderId` returned by the auction API.

---

## Step 6 — Make a Payment

Click **"You won! Pay Now →"** → navigates to `/pay?itemId=<ID>`.

✅ Expected on the Pay page:
- **Winning bid**: `$15.00`
- **Standard shipping**: `$0.00` (items uploaded via the React form use `standardCost: 0`)
- **Pay Now** button is enabled (you are the winner)

> ⚠️ **Known limitation:** The payment service uses a hardcoded mock formula
> (`$100 + shipDays × $5`) and ignores the actual winning bid. The Pay page correctly
> shows `$15`, but the receipt will show `$125` (Standard) or `$110` (Expedited).
> This is a stub in `PaymentServiceImpl`, not a frontend bug.

Click **Pay Now** → navigates to `/payment?itemId=...`.

Fill in mock card details:

| Field       | Value              |
|-------------|--------------------|
| Card number | `4111111111111111` |
| Name        | `Test User`        |
| Expiry      | `12/29`            |
| CVV         | `123`              |

Click **Submit Payment**.

✅ Expected: brief "Processing…" spinner, then redirect to `/receipt?paymentId=<UUID>`.

---

## Step 7 — View the Receipt

✅ Expected:
- **Winning bidder** shows your name and email (from localStorage).
- **Total paid**: `$125.00` for Standard (5 days × $5 + $100 base) or `$110.00` for Expedited.
- **Shipping details**: "The item will be shipped in 5 days." (or 2 for Expedited).
- **Shipping label** reads "Standard" or "Expedited" correctly.

Click **"Back to catalogue"** → returns to `/catalogue`. Full loop complete. ✅

**Flag if:**
- Shipping always shows "Standard" even when Expedited was chosen → `shippingChoice` fix
  not in the running image; rebuild backend.
- Red "Failed to load receipt" → check the `paymentId` UUID in the browser URL bar for
  truncation or encoding issues.

---

## Known Limitations (pre-existing backend stubs, not bugs)

| # | Location | Issue | Severity |
|---|----------|-------|----------|
| 1 | `PaymentServiceImpl` | Hardcodes `$100 + shipDays×$5`; ignores actual winning bid | Medium — mock stub |
| 2 | Receipt page | Total is correct but bid/shipping line-item breakdown is wrong (no `shippingAmount` stored in DB) | Minor — cosmetic |
| 3 | Catalogue page | "Ends At" shows the catalogue item's stored date, not a live auction countdown | Minor — by design |
| 4 | Upload Item page | Newly uploaded items have `standardCost: 0` / `expeditedCost: 0` | Minor — could add cost fields to the upload form |

---

## Quick Rebuild Reference

```bash
# After any backend change
mvn clean package -DskipTests
docker compose down
docker compose build --no-cache
docker compose up

# Frontend only (no rebuild needed for property changes already in the image)
cd frontend && npm run dev
```
