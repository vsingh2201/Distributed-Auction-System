
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

      // Shipping-related fields
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
      // Compute endsAt from "now + duration" (minutes)
      // Format: "YYYY-MM-DDTHH:mm:ss"
      // --------------------------------------------------------------------
      const now = new Date();
      const endDate = new Date(now.getTime() + duration * 60 * 1000);
      const iso = endDate.toISOString(); // "2025-12-05T12:00:00.000Z"
      const endsAt = iso.substring(0, 19); // "2025-12-05T12:00:00"

      // --------------------------------------------------------------------
      // Payload – matches the Catalogue service DTO from Postman
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
        // sellerId: userId,
      };

      try {
        // 1) Create the catalogue item
        const res = await api.createItem(payload);
        const newId = res.itemId || res.id || res.catalogueId || null;

        if (!newId) {
          throw new Error("Catalogue item created but no itemId was returned.");
        }

        // 2) Create the corresponding auction in Auction service
        // Body shape: { itemId, startPrice, endsAt }
        await api.createAuction({
          itemId: Number(newId),
          startPrice: startingBid,
          endsAt: endsAt,
        });

        // 3) Show success message
        showSuccess(
          "Auction item created successfully" +
            (newId ? `! Item ID: ${newId}` : "!")
        );

        // Optional: clear the form for the next upload
        form.reset();
        form.classList.remove("was-validated");
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
