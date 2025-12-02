

(function () {
  function fmt(n) {
    return Number(n || 0).toFixed(2);
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

  async function initPaymentPage() {
    requireLogin();
    const userId = getUserId();

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("itemId");
    const auctionId = params.get("auctionId") || itemId;
    const winning = Number(params.get("winning") || 0);
    const shippingAmount = Number(params.get("ship") || 0);
    const shippingChoice = (params.get("shipping") || "STANDARD").toUpperCase();

    if (!itemId) {
      showError("Missing itemId in URL (e.g. payment.html?itemId=1&auctionId=1)");
      return;
    }

    // Winner info from session
    document.getElementById("winnerName").textContent =
      localStorage.getItem("userName") || `User #${userId}`;
    document.getElementById("winnerEmail").textContent =
      localStorage.getItem("userEmail") || "";

    // Basic labels
    document.getElementById("itemIdLabel").textContent = itemId;
    document.getElementById("auctionIdLabel").textContent = auctionId;
    document.getElementById("winningAmount").textContent = fmt(winning);
    document.getElementById("shippingAmount").textContent = fmt(shippingAmount);
    document.getElementById("totalAmount").textContent = fmt(winning + shippingAmount);
    document.getElementById("shippingChoiceLabel").textContent =
      shippingChoice === "EXPEDITED" ? "Expedited" : "Standard";

    // Try to fetch item name for nicer UI (optional)
    try {
      const item = await api.item(itemId);
      document.getElementById("itemName").textContent =
        item.name || `Item ${itemId}`;
    } catch (e) {
      console.warn("Could not load item details:", e);
    }

    const form = document.getElementById("paymentForm");
    const submitBtn = document.getElementById("submitPaymentBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      clearAlerts();
      submitBtn.disabled = true;

      const payload = {
        itemId: Number(itemId),
        userId: Number(userId),
        shippingChoice: shippingChoice,
        cardNumber: document.getElementById("cardNumber").value.trim(),
        cardName: document.getElementById("cardName").value.trim(),
        cardExp: document.getElementById("cardExp").value.trim(),
        cvv: document.getElementById("cardCvv").value.trim(),
      };

      try {
        const res = await api.pay(payload);

        // This is exactly the structure your Postman response uses:
        // { "paymentId": "ae5bea60-d2c8-4e74-ab4f-e503e2be2ada" }
        const paymentId = res.paymentId || res.id || "";

        showSuccess(
          "Payment submitted successfully" +
            (paymentId ? `! Payment ID: ${paymentId}` : "!")
        );

        // *** REDIRECT TO UC6 RECEIPT PAGE ***
        if (paymentId) {
          // tiny delay so user glimpses the success banner (optional)
          setTimeout(() => {
            window.location.href =
              "receipt.html?paymentId=" + encodeURIComponent(paymentId);
          }, 600);
        }
      } catch (err) {
        console.error(err);
        showError(err.message || "Payment failed. Please check your card details.");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initPaymentPage);
})();
