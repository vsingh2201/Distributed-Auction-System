// js/auction-item.js
// UC7: Auction item upload
// Uses helpers from api.js: requireLogin(), getUserId(), api.createItem()

(function () {
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

  async function initAuctionItemPage() {
    requireLogin();
    const userId = getUserId();

    // Show seller email (nice for the demo)
    const email = localStorage.getItem("userEmail") || "";
    const sellerEmailEl = document.getElementById("sellerEmail");
    if (sellerEmailEl) {
      sellerEmailEl.textContent = email || `User #${userId}`;
    }

    const form = document.getElementById("auctionItemForm");
    const submitBtn = document.getElementById("createAuctionItemBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        return;
      }

      clearAlerts();
      submitBtn.disabled = true;

      // Core UC7 fields
      const name = document.getElementById("itemName").value.trim();

      // Use a dedicated keywords field if present; otherwise fall back to description
      const descEl = document.getElementById("itemDescription");
      const kwEl = document.getElementById("itemKeywords");
      const description = descEl ? descEl.value.trim() : "";
      const keywords = kwEl ? kwEl.value.trim() : description;

      const auctionType = document.getElementById("auctionType").value; // "FORWARD" (not sent to backend)
      const duration = Number(
        document.getElementById("duration").value || 0
      ); // assume minutes
      const startingBid = Number(
        document.getElementById("startingBid").value || 0
      );

      // Shipping-related fields (optional in the form, but used by the Catalogue service)
      const standardCost = Number(
        (document.getElementById("standardCost")?.value || 0)
      );
      const expeditedCost = Number(
        (document.getElementById("expeditedCost")?.value || 0)
      );
      const shipInDays = Number(
        (document.getElementById("shipInDays")?.value || 0)
      );

      // --------------------------------------------------------------------
      // Compute endsAt from "now + duration"
      // Your Postman example uses a string like:  "2025-12-05T12:00:00"
      // We'll generate the same style (no 'Z', no milliseconds).
      // --------------------------------------------------------------------
      const now = new Date();
      const endDate = new Date(now.getTime() + duration * 60 * 1000); // duration in minutes
      const iso = endDate.toISOString(); // e.g. "2025-12-05T12:00:00.000Z"
      const endsAt = iso.substring(0, 19); // "2025-12-05T12:00:00"

      // --------------------------------------------------------------------
      // Payload – matches the Catalogue service DTO from Postman:
      //
      // {
      //   "name": "...",
      //   "keywords": "...",
      //   "startPrice": 25.99,
      //   "endsAt": "2025-12-05T12:00:00",
      //   "status": "ACTIVE",
      //   "standardCost": 5.0,
      //   "expeditedCost": 10.0,
      //   "shipInDays": 2
      // }
      // --------------------------------------------------------------------
      const payload = {
        name,
        keywords,
        startPrice: startingBid,
        endsAt,
        status: "ACTIVE",
        standardCost,
        expeditedCost,
        shipInDays,
        // sellerId: userId,  // add this if/when your Catalogue DTO supports it
      };

      try {
        const res = await api.createItem(payload);
        // Catalogue service returns something like { itemId: 7, ... }
        const newId = res.itemId || res.id || res.catalogueId || "";

        showSuccess(
          "Auction item created successfully" +
            (newId ? `! Item ID: ${newId}` : "!")
        );

        // Optional: clear the form for the next upload
        form.reset();
        form.classList.remove("was-validated");
        // Ensure Forward is still selected and some defaults are set
        if (document.getElementById("auctionType")) {
          document.getElementById("auctionType").value = "FORWARD";
        }
      } catch (err) {
        console.error(err);
        showError(
          err.message ||
            "Failed to create auction item. Please check the fields and try again."
        );
      } finally {
        submitBtn.disabled = false;
      }
    });

    // Simple logout button handler to keep consistent UX
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initAuctionItemPage);
})();
