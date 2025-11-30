// js/catalogue.js
// UC2: Browse Catalogue (search + list + bid link)

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const tbody   = document.getElementById("tbody");
    const error   = document.getElementById("error");
    const q       = document.getElementById("q");
    const btnFind = document.getElementById("searchBtn");

    async function load() {
      error.classList.add("d-none");
      tbody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="text-center py-3">
              <div class="spinner-border" role="status"></div>
              <span class="ms-2">Loading...</span>
            </div>
          </td>
        </tr>`;

      try {
        const keyword = q.value.trim();
        const items = await api.search(keyword);

        if (!items || !items.length) {
          tbody.innerHTML = `
            <tr>
              <td colspan="4" class="text-muted">No items found</td>
            </tr>`;
          return;
        }

        tbody.innerHTML = "";
        items.forEach((it) => {
          const price = it.currentPrice ?? it.startPrice ?? "-";
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${it.name || ("Item " + it.itemId)}</td>
            <td class="text-end">$${price}</td>
            <td>${it.endsAt || "-"}</td>
            <td class="text-end">
              <a class="btn btn-sm btn-outline-primary" href="bid.html?itemId=${it.itemId}">
                Bid
              </a>
            </td>`;
          tbody.appendChild(row);
        });
      } catch (e) {
        console.error(e);
        error.textContent = e.message || "Failed to load catalogue";
        error.classList.remove("d-none");
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-danger">Error</td>
          </tr>`;
      }
    }

    // wire up events
    btnFind.addEventListener("click", load);
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        load();
      }
    });
  });
})();
