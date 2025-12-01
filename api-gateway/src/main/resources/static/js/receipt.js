// js/receipt.js
// UC6: Receipt & Shipping details
// Uses helpers from api.js: requireLogin(), getUserId(), api.receipt(), api.shipping() / api.getShipping()

(function () {
  function fmt(n) {
    return Number(n || 0).toFixed(2);
  }

  function showError(msg) {
    const e = document.getElementById("alertError");
    if (!e) return;
    e.textContent = msg;
    e.classList.remove("d-none");
    const ok = document.getElementById("alertSuccess");
    if (ok) ok.classList.add("d-none");
  }

  function showSuccess(msg) {
    const ok = document.getElementById("alertSuccess");
    if (!ok) return;
    ok.textContent = msg;
    ok.classList.remove("d-none");
    const e = document.getElementById("alertError");
    if (e) e.classList.add("d-none");
  }

  function clearAlerts() {
    const e = document.getElementById("alertError");
    const ok = document.getElementById("alertSuccess");
    if (e) e.classList.add("d-none");
    if (ok) ok.classList.add("d-none");
  }

  async function initReceiptPage() {
    requireLogin();
    const userId = getUserId();

    // winner info from localStorage (set during login)
    document.getElementById("winnerName").textContent =
      localStorage.getItem("userName") || `User #${userId}`;
    document.getElementById("winnerEmail").textContent =
      localStorage.getItem("userEmail") || "";

    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId");

    if (!paymentId) {
      showError(
        "Missing paymentId in URL (e.g. receipt.html?paymentId=1234-uuid)."
      );
      return;
    }

    clearAlerts();

    try {
      // 1) Fetch receipt from Payment service
      const r = await api.receipt(paymentId);
      document.getElementById("paymentIdLabel").textContent =
        r.paymentId || r.id || paymentId;

      // Try to be flexible about field names
      const itemId =
        r.itemId ?? r.auctionItemId ?? (r.item && r.item.id) ?? null;
      const shippingChoice = (r.shippingChoice || "STANDARD").toUpperCase();

      const totalPaid =
        Number(
          r.totalAmount ?? r.total ?? r.amountPaid ?? r.totalPrice ?? 0
        ) || 0;

      const shippingAmount =
        Number(
          r.shippingAmount ??
            r.shippingCost ??
            r.shipping ??
            r.shipCost ??
            0
        ) || 0;

      let bidAmount =
        Number(
          r.bidAmount ??
            r.winningBid ??
            r.itemAmount ??
            (totalPaid - shippingAmount)
        ) || 0;

      // If we computed a negative value by mistake, clamp
      if (bidAmount < 0 && totalPaid > 0) {
        bidAmount = totalPaid;
      }

      // Fill receipt UI
      document.getElementById("itemIdLabel").textContent = itemId ?? "–";
      document.getElementById("bidAmount").textContent = fmt(bidAmount);
      document.getElementById("shippingAmount").textContent =
        fmt(shippingAmount);
      document.getElementById("totalAmount").textContent = fmt(totalPaid);
      document.getElementById("shippingChoiceLabel").textContent =
        shippingChoice === "EXPEDITED" ? "Expedited" : "Standard";

      // 2) Try to show item name from Catalogue (optional)
      if (itemId != null) {
        try {
          const item = await api.item(itemId);
          document.getElementById("itemName").textContent =
            item.name || `Item ${itemId}`;
        } catch (e) {
          console.warn("Could not load item details for receipt:", e);
        }

        // 3) Shipping time from Catalogue's /shipping endpoint
        try {
          // you have both api.shipping and api.getShipping; use either.
          const ship =
            (api.shipping && (await api.shipping(itemId))) ||
            (api.getShipping && (await api.getShipping(itemId)));

          const days =
            ship.shipInDays ??
            ship.shippingDays ??
            ship.shipDays ??
            null;

          const msgEl = document.getElementById("shippingMessage");
          if (days != null) {
            msgEl.textContent = `The item will be shipped in ${days} day${
              Number(days) === 1 ? "" : "s"
            }.`;
          } else {
            msgEl.textContent =
              "Shipping time information is not available for this item.";
          }
        } catch (e) {
          console.warn("Could not load shipping time:", e);
          document.getElementById("shippingMessage").textContent =
            "Shipping time information is not available for this item.";
        }
      } else {
        document.getElementById("shippingMessage").textContent =
          "Shipping time information is not available for this item.";
      }

      showSuccess("Receipt loaded successfully.");
    } catch (e) {
      console.error(e);
      showError(
        e.message ||
          "Failed to load receipt information. Please verify the payment ID."
      );
    }

    // simple logout button support
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initReceiptPage);
})();
