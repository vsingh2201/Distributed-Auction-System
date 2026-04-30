const USER_BASE      = '/user-service'
const CATALOGUE_BASE = '/catalogue-service'
const AUCTION_BASE   = '/auction-service'
const PAYMENT_BASE   = '/payment-service'

async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

const api = {
  // UC1: Auth
  login: (email, password) =>
    apiFetch(`${USER_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (payload) =>
    apiFetch(`${USER_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: async (email, newPassword) => {
    const res = await fetch(`${USER_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Request failed: ${res.status}`)
    return text
  },

  // UC2: Catalogue
  search: (keyword) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue/search?q=${encodeURIComponent(keyword || '')}`),

  item: (id) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue/${id}`),

  shipping: (id) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue/${id}/shipping`),

  createItem: (payload) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // UC3/4: Auction
  state: (itemId) =>
    apiFetch(`${AUCTION_BASE}/auctions/${itemId}`),

  bid: (itemId, userId, amount) =>
    apiFetch(`${AUCTION_BASE}/auctions/${itemId}/bid`, {
      method: 'POST',
      body: JSON.stringify({ bidderId: Number(userId), amount: Number(amount) }),
    }),

  createAuction: (itemId, startPrice, endsAt, sellerId) =>
    apiFetch(`${AUCTION_BASE}/auctions`, {
      method: 'POST',
      body: JSON.stringify({ itemId, startPrice, endsAt, sellerId }),
    }),

  getShipping: (itemId) =>
    apiFetch(`${CATALOGUE_BASE}/catalogue/${itemId}/shipping`),

  // UC5: Payment
  pay: (payload) =>
    apiFetch(`${PAYMENT_BASE}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        itemId:         payload.itemId,
        userId:         payload.userId,
        shippingChoice: payload.shippingChoice,
        cardNumber:     payload.cardNumber,
        cardName:       payload.cardName,
        cardExp:        payload.cardExp,
        cvv:            payload.cvv,
      }),
    }),

  // UC6: Receipt
  receipt: (paymentId) =>
    apiFetch(`${PAYMENT_BASE}/receipts/${paymentId}`),
}

export default api
