// js/auction.js
// Logic for bid.html – uses helpers from api.js: api.state, api.bid, requireLogin, getUserId

(function () {
  let pollInterval = null;
  let countdownInterval = null;

  function initBidPage() {
    requireLogin();

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("itemId");
    const userId = getUserId();

    const alertErr = document.getElementById("alertError");
    const alertOk  = document.getElementById("alertSuccess");
    const itemEl   = document.getElementById("item");
    const priceEl  = document.getElementById("price");
    const hbEl     = document.getElementById("hb");
    const countdownEl = document.getElementById("countdown");
    const bidForm  = document.getElementById("bidForm");
    const amountEl = document.getElementById("amount");

    if (!itemId) {
      showError("Missing itemId in URL.");
      return;
    }
    itemEl.textContent = itemId;

    function showError(msg) {
      alertErr.textContent = msg;
      alertErr.classList.remove("d-none");
    }

    function hideError() {
      alertErr.classList.add("d-none");
    }

    function showSuccess(msg) {
      alertOk.textContent = msg;
      alertOk.classList.remove("d-none");
      setTimeout(() => alertOk.classList.add("d-none"), 2500);
    }

    async function loadState() {
      try {
        const state = await api.state(itemId);
        renderState(state);
      } catch (e) {
        console.error(e);
        showError(e.message || "Failed to fetch auction state.");
      }
    }

    function renderState(state) {
      // 🔄 use AuctionView.currentPrice (no startPrice here)
      const price = state.currentPrice != null ? state.currentPrice : "-";
      priceEl.textContent = price === "-" ? "$-" : `$${price}`;

      hbEl.textContent = state.highestBidderId != null ? state.highestBidderId : "-";

      // 🔄 use AuctionView.endTime
      startCountdown(state.endTime, state.status);
      if (state.status && state.status !== "ACTIVE" && state.status !== "OPEN") {
        stopPolling();
      }

    }

    function startCountdown(endTimeIso, status) {
      if (countdownInterval) clearInterval(countdownInterval);

      if (!endTimeIso) {
        countdownEl.textContent = "Auction ended";
        return;
      }

      // consider OPEN and ACTIVE as running auctions
      const isActive = !status || status === "ACTIVE" || status === "OPEN";
      if (!isActive) {
        countdownEl.textContent = "Auction ended";
        return;
      }

      const endTime = new Date(endTimeIso).getTime();

      const tick = () => {
        const diff = endTime - Date.now();
        if (diff <= 0) {
          countdownEl.textContent = "Auction ended";
          clearInterval(countdownInterval);
          return;
        }
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        countdownEl.textContent = `Ends in ${minutes}m ${seconds}s`;
      };

      tick();
      countdownInterval = setInterval(tick, 1000);
    }


    function startPolling() {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(loadState, 5000); // every 5 seconds
    }

    function stopPolling() {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = null;
    }

    // form submit handler
    bidForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      bidForm.classList.add("was-validated");
      if (!bidForm.checkValidity()) return;

      hideError();
      try {
        await api.bid(itemId, userId, amountEl.value);
        showSuccess("Bid placed successfully!");
        amountEl.value = "";
        await loadState(); // refresh immediately
      } catch (e) {
        console.error(e);
        showError(e.message || "Bid failed. Make sure it is higher than the current price.");
      }
    });

    // initial load + polling
    (async function start() {
      if (!userId) { requireLogin(); return; }
      await loadState();
      startPolling();
    })();
  }

  // init when DOM is ready
  document.addEventListener("DOMContentLoaded", initBidPage);
})();
