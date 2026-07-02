(() => {
  const isInsightPost = document.body.classList.contains("insight-page") ||
    window.location.pathname.includes("/pages/insights/");

  if (!isInsightPost) return;

  const article = document.querySelector("main.content");
  if (!article) return;

  const headings = Array.from(article.querySelectorAll("h2[id], h3[id]"))
    .filter((heading) => !heading.closest(".more-insights"));

  if (headings.length < 2) return;

  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = '<span class="reading-progress-fill"></span>';

  const toc = document.createElement("aside");
  toc.className = "insight-reader-toc";
  toc.setAttribute("aria-label", "Insight table of contents");

  const wordCount = article.textContent.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 225));

  toc.innerHTML = `
    <p class="reader-toc-kicker">Reading Guide</p>
    <p class="reader-toc-meta"><span data-read-progress>0%</span> read · ${readMinutes} min</p>
    <nav>
      ${headings.map((heading) => `
        <a class="reader-toc-link reader-toc-${heading.tagName.toLowerCase()}" href="#${heading.id}">
          ${heading.textContent.trim()}
        </a>
      `).join("")}
    </nav>
  `;

  document.body.append(progress, toc);

  const fill = progress.querySelector(".reading-progress-fill");
  const progressLabel = toc.querySelector("[data-read-progress]");
  const links = Array.from(toc.querySelectorAll(".reader-toc-link"));

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const articleTop = article.offsetTop;
    const maxScroll = Math.max(1, article.offsetHeight - window.innerHeight);
    const rawProgress = (scrollTop - articleTop) / maxScroll;
    const percentage = Math.min(100, Math.max(0, rawProgress * 100));

    fill.style.width = `${percentage}%`;
    progressLabel.textContent = `${Math.round(percentage)}%`;
  };

  const setActiveLink = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible[0]) setActiveLink(visible[0].target.id);
  }, {
    rootMargin: "-18% 0px -65% 0px",
    threshold: 0.01
  });

  headings.forEach((heading) => observer.observe(heading));
  setActiveLink(headings[0].id);
  updateProgress();

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
})();
