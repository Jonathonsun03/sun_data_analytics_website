(() => {
  const listingConfigs = [
    {
      pagePath: "/pages/insights.html",
      listingId: "listing-published-insights",
      label: "Category",
      allLabel: "All categories",
      chipLabel: "Filter insights by category",
      controlKey: "insight"
    },
    {
      pagePath: "/pages/portfolio.html",
      listingId: "listing-portfolio-samples",
      label: "Project Type",
      allLabel: "All project types",
      chipLabel: "Filter portfolio projects by type",
      controlKey: "portfolio"
    }
  ];

  const config = listingConfigs.find((item) => window.location.pathname.endsWith(item.pagePath));
  if (!config) return;

  const decodeCategories = (encoded) => {
    if (!encoded) return [];

    try {
      return decodeURIComponent(window.atob(encoded))
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const waitForListing = () => {
    const listing = window["quarto-listings"]?.[config.listingId];
    const listingEl = document.querySelector(`#${config.listingId}`);
    const rows = Array.from(document.querySelectorAll(`#${config.listingId} tbody tr`));
    const listItems = Array.from(listing?.items || [])
      .map((item) => item.elm)
      .filter(Boolean);
    const categoryElements = Array.from(new Set([...rows, ...listItems]));

    if (!listing || !listingEl || !categoryElements.length) {
      window.setTimeout(waitForListing, 80);
      return;
    }

    const categories = Array.from(new Set(categoryElements.flatMap((row) => decodeCategories(row.dataset.categories))))
      .sort((a, b) => a.localeCompare(b));

    if (!categories.length || document.querySelector(`[data-listing-category-filter="${config.listingId}"]`)) return;

    const controls = document.createElement("div");
    controls.className = "listing-category-controls";
    controls.setAttribute("data-listing-category-filter", config.listingId);

    const selectId = `${config.controlKey}-category-select`;

    controls.innerHTML = `
      <label class="listing-category-select-label" for="${selectId}">${config.label}</label>
      <select id="${selectId}" class="listing-category-select">
        <option value="">${config.allLabel}</option>
        ${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}
      </select>
      <div class="listing-category-chips" aria-label="${config.chipLabel}">
        <button type="button" class="listing-category-chip is-active" data-category="">All</button>
        ${categories.map((category) => `
          <button type="button" class="listing-category-chip" data-category="${category}">${category}</button>
        `).join("")}
      </div>
    `;

    listingEl.insertAdjacentElement("beforebegin", controls);

    const select = controls.querySelector(`#${selectId}`);
    const chips = Array.from(controls.querySelectorAll(".listing-category-chip"));

    const applyCategory = (selectedCategory) => {
      listing.filter((item) => {
        if (!selectedCategory) return true;
        return decodeCategories(item.elm.dataset.categories).includes(selectedCategory);
      });

      select.value = selectedCategory;
      chips.forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset.category === selectedCategory);
      });
    };

    select.addEventListener("change", () => applyCategory(select.value));
    chips.forEach((chip) => {
      chip.addEventListener("click", () => applyCategory(chip.dataset.category));
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForListing);
  } else {
    waitForListing();
  }
})();
