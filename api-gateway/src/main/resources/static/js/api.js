// js/api.js

// Base URLs through the API gateway
const USER_BASE      = "/user-service";
const CATALOGUE_BASE = "/catalogue-service";
const AUCTION_BASE   = "/auction-service";
const PAYMENT_BASE   = "/payment-service";

// ---------- Session helpers ----------
function setUserSession(user) {
  // user is the JSON returned from /auth/login
  localStorage.setItem("userId", user.id);
  localStorage.setItem("userEmail", user.email || "");
  localStorage.setItem("userName", user.username || "");
}

function getUserId() {
  return localStorage.getItem("userId");
}

function requireLogin() {
  if (!getUserId()) {
    window.location.href = "index.html";
  }
}

// ---------- Generic fetch helper ----------
async function apiFetch(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---------- API object ----------
const api = {
  // UC1: Auth --------------------------------------------------------
  // login with EMAIL + password
  login: (email, password) =>
    apiFetch(`${USER_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // sign up (register)
  signup: (payload) =>
    apiFetch(`${USER_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
// forgot password / reset
  resetPassword: async (email, newPassword) => {
    const res = await fetch(`${USER_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const text = await res.text(); // backend returns plain text

    if (!res.ok) {
      throw new Error(text || `Request failed: ${res.status}`);
    }

    // on success text will be "Password reset successfully"
    return text;
  },

  // UC2: Catalogue ---------------------------------------------------
  search: (keyword) =>
    apiFetch(
      `${CATALOGUE_BASE}/catalogue/search?q=${encodeURIComponent(keyword || "")}`
    ),

  item: (id) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue/${id}`),

  shipping: (id) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue/${id}/shipping`),

  createItem: (payload) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // UC3/4: Auction ---------------------------------------------------
  state: (itemId) =>
    apiFetch(`${AUCTION_BASE}/auctions/${itemId}`),

 // place a bid on an item
 bid: (itemId, userId, amount) =>
   apiFetch(`${AUCTION_BASE}/auctions/${itemId}/bid`, {
     method: "POST",
     body: JSON.stringify({
       bidderId: Number(userId),      // must be bidderId
       amount: Number(amount),        // make it a number
     }),
   }),


  // UC5/6: Payment / Receipt ----------------------------------------
  pay: (payload) =>
    apiFetch(`${PAYMENT_BASE}/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  receipt: (paymentId) =>
    apiFetch(`${PAYMENT_BASE}/receipts/${paymentId}`),
};
