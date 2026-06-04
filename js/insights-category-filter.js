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

    const label = document.createElement("label");
    label.className = "listing-category-select-label";
    label.setAttribute("for", selectId);
    label.textContent = config.label;

    const select = document.createElement("select");
    select.id = selectId;
    select.className = "listing-category-select";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = config.allLabel;
    select.appendChild(allOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });

    const chipList = document.createElement("div");
    chipList.className = "listing-category-chips";
    chipList.setAttribute("aria-label", config.chipLabel);

    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "listing-category-chip is-active";
    allChip.dataset.category = "";
    allChip.textContent = "All";
    chipList.appendChild(allChip);

    categories.forEach((category) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "listing-category-chip";
      chip.dataset.category = category;
      chip.textContent = category;
      chipList.appendChild(chip);
    });

    controls.append(label, select, chipList);

    listingEl.insertAdjacentElement("beforebegin", controls);

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
