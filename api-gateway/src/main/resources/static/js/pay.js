

(function () {
  let winningPrice = 0;
  let standardShipping = 0;
  let expeditedExtra = 0;

  function fmt(amount) {
    return Number(amount || 0).toFixed(2);
  }

  function showError(msg) {
    const a = document.getElementById("alertError");
    if (!a) return;
    a.textContent = msg;
    a.classList.remove("d-none");
    const ok = document.getElementById("alertSuccess");
    if (ok) ok.classList.add("d-none");
  }

  function showSuccess(msg) {
    const a = document.getElementById("alertSuccess");
    if (!a) return;
    a.textContent = msg;
    a.classList.remove("d-none");
    const err = document.getElementById("alertError");
    if (err) err.classList.add("d-none");
  }

  function clearAlerts() {
    const err = document.getElementById("alertError");
    const ok = document.getElementById("alertSuccess");
    if (err) err.classList.add("d-none");
    if (ok) ok.classList.add("d-none");
  }

  function recalcTotals() {
    const expeditedCheckbox = document.getElementById("expeditedCheckbox");
    if (!expeditedCheckbox) return;

    const expeditedChecked = expeditedCheckbox.checked;
    const shippingTotal = standardShipping + (expeditedChecked ? expeditedExtra : 0);
    const grandTotal = winningPrice + shippingTotal;

    const shipEl = document.getElementById("shippingTotal");
    const grandEl = document.getElementById("grandTotal");
    if (shipEl) shipEl.textContent = fmt(shippingTotal);
    if (grandEl) grandEl.textContent = fmt(grandTotal);
  }

  async function initPayPage() {
    requireLogin();
    const userId = getUserId();

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("itemId");
    // auctionId is just for display / passing along
    const auctionId = params.get("auctionId") || itemId;

    const payBtn = document.getElementById("payBtn");
    const expeditedCheckbox = document.getElementById("expeditedCheckbox");

    const itemIdLabel = document.getElementById("itemIdLabel");
    const auctionIdLabel = document.getElementById("auctionIdLabel");
    if (itemIdLabel) itemIdLabel.textContent = itemId || "–";
    if (auctionIdLabel) auctionIdLabel.textContent = auctionId || "–";

    if (!itemId) {
      showError("Missing itemId in URL (e.g. pay.html?itemId=1&auctionId=1)");
      if (payBtn) payBtn.disabled = true;
      return;
    }

    clearAlerts();
    if (payBtn) payBtn.disabled = true;

    try {
      // 1) Get auction state (winner + winning price)
      const state = await api.state(itemId);
      winningPrice = Number(state.currentPrice || state.startPrice || 0);
      const winnerId = state.highestBidderId;

      const winningPriceEl = document.getElementById("winningPrice");
      const winnerIdEl = document.getElementById("winnerId");
      if (winningPriceEl) winningPriceEl.textContent = fmt(winningPrice);
      if (winnerIdEl) winnerIdEl.textContent = winnerId != null ? winnerId : "-";

      // Client-side winner check (server still validates)
      if (!winnerId || Number(winnerId) !== Number(userId)) {
        if (payBtn) payBtn.disabled = true;
        showError(
          "You are not the winning bidder for this auction, so you cannot pay for this item."
        );
      }

      // 2) Get shipping info from Catalogue service
      try {
        const ship = await api.getShipping(itemId);
        // Your backend returns: { standardCost, expeditedCost, shipInDays }
        standardShipping = Number(
          ship.standardCost ??
          ship.standardShipping ??
          ship.standard_cost ??
          0
        );

        expeditedExtra = Number(
          ship.expeditedCost ??
          ship.expeditedExtra ??
          ship.expedited_cost ??
          0
        );


        const itemNameEl = document.getElementById("itemName");
        const shippingPriceEl = document.getElementById("shippingPrice");
        const expeditedPriceEl = document.getElementById("expeditedPrice");

        if (itemNameEl)
          itemNameEl.textContent = ship.itemName || ship.name || `Item ${itemId}`;
        if (shippingPriceEl) shippingPriceEl.textContent = fmt(standardShipping);
        if (expeditedPriceEl) expeditedPriceEl.textContent = fmt(expeditedExtra);
      } catch (e) {
        console.error(e);
        showError(
          "Could not load shipping information. You can still see the winning price."
        );
      }

      recalcTotals();

      // Enable Pay Now button only if current user is winner
      if (
        payBtn &&
        state.highestBidderId &&
        Number(state.highestBidderId) === Number(userId)
      ) {
        payBtn.disabled = false;
      }
    } catch (e) {
      console.error(e);
      showError(e.message || "Failed to load auction/payment information.");
      return;
    }

    if (expeditedCheckbox) {
      expeditedCheckbox.addEventListener("change", recalcTotals);
    }

    // 3) When Pay Now is clicked, redirect to payment.html for UC5
    if (payBtn) {
      payBtn.addEventListener("click", (evt) => {
        if (evt) evt.preventDefault();
        clearAlerts();

        const expedited = expeditedCheckbox ? expeditedCheckbox.checked : false;
        const shippingTotal =
          standardShipping + (expedited ? expeditedExtra : 0);
        const shippingChoice = expedited ? "EXPEDITED" : "STANDARD";

        const url = new URL("payment.html", window.location.origin);
        url.searchParams.set("itemId", itemId);
        url.searchParams.set("auctionId", auctionId);
        url.searchParams.set("winning", winningPrice);
        url.searchParams.set("ship", shippingTotal);
        url.searchParams.set("shipping", shippingChoice);

        // Hand off to UC5 Payment page
        window.location.href = url.toString();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initPayPage);
})();
