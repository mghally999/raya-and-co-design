/* RAYAA & CO — vanilla JS (no animations)
   Only: theme toggle, mobile nav, active nav state, content rendering,
   product swatch tints, contact + newsletter forms, footer year. */
(function () {
  /* Active nav underline CSS injected from JS */
  function injectActiveNavCSS() {
    if (document.getElementById("rayaa-active-nav-style")) return;

    const style = document.createElement("style");
    style.id = "rayaa-active-nav-style";
    style.textContent = `
      [data-nav-link] {
        position: relative;
      }

      [data-nav-link]::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -6px;
        width: 100%;
        height: 1px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 220ms ease;
        pointer-events: none;
      }

      [data-nav-link].is-active::after {
        transform: scaleX(1);
      }

      [data-nav-link].is-active {
        opacity: 1;
      }

      #mobile-nav [data-nav-link]::after {
        bottom: -3px;
      }
    `;
    document.head.appendChild(style);
  }

  /* Theme */
  function initTheme() {
    let stored = null;
    try {
      stored = localStorage.getItem("rayaa-theme");
    } catch (_) {}

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = stored || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initial);
    updateThemeIcons(initial);
  }

  function updateThemeIcons(theme) {
    const isDark = theme === "dark";

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute(
        "aria-label",
        `Switch to ${isDark ? "light" : "dark"} theme`,
      );

      const sun = btn.querySelector(".icon-sun");
      const moon = btn.querySelector(".icon-moon");

      if (sun) sun.style.display = isDark ? "none" : "block";
      if (moon) moon.style.display = isDark ? "block" : "none";
    });
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = cur === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", next);

    try {
      localStorage.setItem("rayaa-theme", next);
    } catch (_) {}

    updateThemeIcons(next);
  }

  function initThemeToggle() {
    document
      .querySelectorAll(".theme-toggle")
      .forEach((btn) => btn.addEventListener("click", toggleTheme));
  }

  /* Mobile nav */
  function initMobileNav() {
    const sheet = document.getElementById("mobile-nav");
    const btn = document.querySelector(".hamburger");

    if (!sheet || !btn) return;

    let prevOverflow = "";

    function setOpen(open) {
      if (open) {
        sheet.classList.add("is-open");
        btn.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-label", "Close menu");
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        sheet.classList.remove("is-open");
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Open menu");
        document.body.style.overflow = prevOverflow;
      }
    }

    btn.addEventListener("click", () =>
      setOpen(!sheet.classList.contains("is-open")),
    );

    const backdrop = sheet.querySelector(".mobile-nav-backdrop");
    if (backdrop) backdrop.addEventListener("click", () => setOpen(false));

    sheet.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sheet.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  }

  /* Active nav */
  function normalizePath(path) {
    if (!path) return "index.html";

    let clean = path.split("?")[0].split("#")[0].split("/").pop().toLowerCase();

    if (!clean || clean === "") clean = "index.html";

    return clean;
  }

  function getLinkPage(a) {
    const href = a.getAttribute("href") || "";

    if (!href || href === "#") return "";

    try {
      const url = new URL(href, window.location.href);
      return normalizePath(url.pathname);
    } catch (_) {
      return normalizePath(href);
    }
  }

  function clearActiveNav() {
    document.querySelectorAll("[data-nav-link]").forEach((a) => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });
  }

  function setActiveNavByElement(clickedLink) {
    if (!clickedLink) return;

    const clickedKey = clickedLink.getAttribute("data-nav-link");
    const clickedPage = getLinkPage(clickedLink);
    const clickedHref = clickedLink.getAttribute("href") || "";

    clearActiveNav();

    document.querySelectorAll("[data-nav-link]").forEach((a) => {
      const key = a.getAttribute("data-nav-link");
      const page = getLinkPage(a);
      const href = a.getAttribute("href") || "";

      const sameKey = clickedKey && key && clickedKey === key;
      const samePage = clickedPage && page && clickedPage === page;
      const sameHref = clickedHref && href && clickedHref === href;

      if (sameKey || samePage || sameHref) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function markActiveNav() {
    const currentPage = normalizePath(window.location.pathname);
    const currentHash = window.location.hash;

    let matched = false;

    clearActiveNav();

    document.querySelectorAll("[data-nav-link]").forEach((a) => {
      const key = (a.getAttribute("data-nav-link") || "").toLowerCase();
      const href = a.getAttribute("href") || "";
      const linkPage = getLinkPage(a);

      let isActive = false;

      if (currentHash && href.includes(currentHash)) {
        isActive = true;
      } else if (linkPage && linkPage === currentPage) {
        isActive = true;
      } else if (key && currentPage.indexOf(key) === 0) {
        isActive = true;
      } else if (
        currentPage === "index.html" &&
        (key === "home" || linkPage === "index.html")
      ) {
        isActive = true;
      }

      if (isActive) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
        matched = true;
      }
    });

    if (!matched && currentPage === "index.html") {
      const homeLink =
        document.querySelector('[data-nav-link="home"]') ||
        document.querySelector('[href="index.html"]') ||
        document.querySelector('[href="./index.html"]');

      if (homeLink) {
        homeLink.classList.add("is-active");
        homeLink.setAttribute("aria-current", "page");
      }
    }
  }

  function initActiveNavClicks() {
    document.querySelectorAll("[data-nav-link]").forEach((a) => {
      a.addEventListener("click", function () {
        setActiveNavByElement(this);
      });
    });

    window.addEventListener("popstate", markActiveNav);
    window.addEventListener("hashchange", markActiveNav);
  }

  /* Product card */
  function renderProductCard(p, priority) {
    const article = document.createElement("article");
    article.className = "product-card";

    if (p.tag) {
      const b = document.createElement("span");
      b.className = "badge";
      b.textContent = p.tag;
      article.appendChild(b);
    }

    const frame = document.createElement("div");
    frame.className = "frame";

    const figure = document.createElement("div");
    figure.className = "figure";

    const img = document.createElement("img");
    img.src = p.image;
    img.alt = `${p.name} — ${p.category}`;
    img.loading = priority ? "eager" : "lazy";
    img.decoding = "async";

    figure.appendChild(img);
    frame.appendChild(figure);
    article.appendChild(frame);

    const meta = document.createElement("div");
    meta.className = "meta";

    const left = document.createElement("div");
    left.className = "meta-left";

    const name = document.createElement("h3");
    name.className = "name";
    name.textContent = p.name;
    left.appendChild(name);

    const cat = document.createElement("p");
    cat.className = "cat";
    cat.textContent = p.category;
    left.appendChild(cat);

    const swatchRow = document.createElement("div");
    swatchRow.className = "swatch-row";
    swatchRow.setAttribute("role", "radiogroup");
    swatchRow.setAttribute("aria-label", `${p.name} colour options`);

    p.swatches.forEach((c) => {
      const sw = document.createElement("button");
      sw.type = "button";
      sw.className = "swatch";
      sw.setAttribute("role", "radio");
      sw.setAttribute("aria-checked", "false");
      sw.setAttribute("aria-label", `Show in ${c}`);
      sw.style.background = c;

      sw.addEventListener("click", (e) => {
        e.stopPropagation();

        const current = swatchRow.querySelector(".swatch.is-active");
        const isSame = current && current === sw;

        swatchRow.querySelectorAll(".swatch").forEach((s) => {
          s.classList.remove("is-active");
          s.setAttribute("aria-checked", "false");
        });

        figure.querySelectorAll(".tint").forEach((t) => t.remove());

        if (!isSame) {
          sw.classList.add("is-active");
          sw.setAttribute("aria-checked", "true");

          const tint = document.createElement("span");
          tint.className = "tint tint-color";
          tint.style.background = c;
          tint.setAttribute("aria-hidden", "true");

          const shade = document.createElement("span");
          shade.className = "tint tint-shade";
          shade.setAttribute("aria-hidden", "true");

          figure.appendChild(tint);
          figure.appendChild(shade);
        }
      });

      swatchRow.appendChild(sw);
    });

    left.appendChild(swatchRow);

    const right = document.createElement("div");
    right.className = "text-right";

    if (p.compareAt) {
      const cmp = document.createElement("span");
      cmp.className = "compare";
      cmp.textContent = `AED ${p.compareAt.toLocaleString()}`;
      right.appendChild(cmp);
    }

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = `AED ${p.price.toLocaleString()}`;
    right.appendChild(price);

    meta.appendChild(left);
    meta.appendChild(right);
    article.appendChild(meta);

    return article;
  }

  function renderProductGrid(targetId, limit) {
    const target = document.getElementById(targetId);
    if (!target || !window.RAYAA_PRODUCTS) return;

    const list =
      typeof limit === "number"
        ? window.RAYAA_PRODUCTS.slice(0, limit)
        : window.RAYAA_PRODUCTS;

    const frag = document.createDocumentFragment();

    list.forEach((p, i) => {
      frag.appendChild(renderProductCard(p, i < 4));
    });

    target.appendChild(frag);
  }

  /* Marquee — static row, no scroll animation, no duplication */
  function renderMarquee(targetId, items) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const list = items || window.RAYAA_MARQUEE_ITEMS || [];

    const track = document.createElement("div");
    track.className = "marquee-track";

    list.forEach((t) => {
      const s = document.createElement("span");

      const em = document.createElement("em");
      em.textContent = t;
      s.appendChild(em);

      const dot = document.createElement("span");
      dot.className = "dot";
      s.appendChild(dot);

      track.appendChild(s);
    });

    target.appendChild(track);
  }

  /* Journal teaser */
  function renderJournalTeaser(targetId) {
    const target = document.getElementById(targetId);
    if (!target || !window.RAYAA_JOURNAL) return;

    const frag = document.createDocumentFragment();

    window.RAYAA_JOURNAL.forEach((j) => {
      const a = document.createElement("article");
      a.className = "journal-card";

      a.innerHTML =
        '<div class="img"><img src="' +
        j.image +
        '" alt="' +
        j.title +
        '" loading="lazy" decoding="async" /></div>' +
        '<p class="eyebrow no-rule">' +
        j.date +
        "</p>" +
        '<h3 class="h-md">' +
        j.title +
        "</h3>" +
        '<p class="excerpt">' +
        j.excerpt +
        "</p>" +
        '<span class="read">Read entry ' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
        "</span>";

      frag.appendChild(a);
    });

    target.appendChild(frag);
  }

  /* Footer year */
  function setYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* Forms */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const submit = form.querySelector('[type="submit"]');

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submit) submit.textContent = "Sent — thank you";
    });
  }

  function initNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    if (!form) return;

    const submit = form.querySelector("button[type='submit']");
    const input = form.querySelector("input");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (submit) submit.textContent = "Subscribed";
      if (input) input.value = "";
    });
  }

  function init() {
    injectActiveNavCSS();
    initTheme();
    initThemeToggle();
    initMobileNav();
    markActiveNav();
    initActiveNavClicks();
    setYear();
    initContactForm();
    initNewsletterForm();
  }

  window.RAYAA = {
    renderProductGrid,
    renderMarquee,
    renderJournalTeaser,
    renderProductCard,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
