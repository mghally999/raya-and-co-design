/* RAYAA & CO — vanilla JS
   theme toggle, mobile nav, active nav, content rendering, product swatches,
   contact + newsletter forms, footer year, and the cart + checkout flow. */
(function () {
  const CART_STORAGE_KEY = "rayaa-cart-v1";

  /* ───────────────────────── Active nav CSS ───────────────────────── */
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

  /* ───────────────────────── Theme ───────────────────────── */
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

  /* ───────────────────────── Mobile nav ───────────────────────── */
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

  /* ───────────────────────── Active nav ───────────────────────── */
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

  /* ───────────────────────── Cart state ───────────────────────── */
  function readCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeCart(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
    updateCartBadges();
    renderCartContents();
  }

  function findProductById(id) {
    if (!window.RAYAA_PRODUCTS) return null;
    return window.RAYAA_PRODUCTS.find((p) => p.id === id) || null;
  }

  function cartItemKey(productId, swatch) {
    return `${productId}::${swatch || ""}`;
  }

  function addToCart(productId, swatch, qty) {
    const product = findProductById(productId);
    if (!product) return;
    const items = readCart();
    const key = cartItemKey(productId, swatch);
    const existing = items.find((i) => cartItemKey(i.id, i.swatch) === key);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + (qty || 1));
    } else {
      items.push({
        id: productId,
        swatch: swatch || null,
        qty: Math.max(1, qty || 1),
      });
    }
    cartView = "cart";
    writeCart(items);
    openCart();
    flashAdded(product.name);
  }

  function updateQty(productId, swatch, qty) {
    const items = readCart();
    const key = cartItemKey(productId, swatch);
    const next = items
      .map((i) => {
        if (cartItemKey(i.id, i.swatch) !== key) return i;
        return { ...i, qty: Math.max(0, Math.min(99, qty)) };
      })
      .filter((i) => i.qty > 0);
    writeCart(next);
  }

  function removeFromCart(productId, swatch) {
    const items = readCart();
    const key = cartItemKey(productId, swatch);
    writeCart(items.filter((i) => cartItemKey(i.id, i.swatch) !== key));
  }

  function clearCart() {
    writeCart([]);
  }

  function cartCount() {
    return readCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function cartSubtotal() {
    return readCart().reduce((sum, i) => {
      const p = findProductById(i.id);
      if (!p) return sum;
      return sum + p.price * i.qty;
    }, 0);
  }

  function formatAED(n) {
    return "AED " + Number(n).toLocaleString();
  }

  function updateCartBadges() {
    const count = cartCount();
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = String(count);
      el.classList.toggle("is-empty", count === 0);
    });
  }

  /* ───────────────────────── Cart drawer ───────────────────────── */
  function injectCartDrawer() {
    if (document.getElementById("cart-drawer")) return;

    const root = document.createElement("div");
    root.id = "cart-drawer";
    root.className = "cart-drawer";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <button type="button" class="cart-drawer-backdrop" aria-label="Close cart"></button>
      <aside class="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header class="cart-drawer-head">
          <div>
            <span class="eyebrow no-rule" data-cart-eyebrow>Your Cart</span>
            <h2 class="h-md" data-cart-title>The Bag</h2>
          </div>
          <button type="button" class="cart-close" aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </header>
        <div class="cart-drawer-body" data-cart-body></div>
        <footer class="cart-drawer-foot" data-cart-foot></footer>
      </aside>
    `;
    document.body.appendChild(root);

    root
      .querySelector(".cart-drawer-backdrop")
      .addEventListener("click", () => closeCart());
    root
      .querySelector(".cart-close")
      .addEventListener("click", () => closeCart());

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("is-open")) {
        closeCart();
      }
    });
  }

  let cartView = "cart"; // "cart" | "checkout" | "thanks"
  let lastOrder = null;

  function openCart() {
    const root = document.getElementById("cart-drawer");
    if (!root) return;
    if (cartView === "checkout" && readCart().length === 0) cartView = "cart";
    renderCartContents();
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open-lock");
  }

  function closeCart() {
    const root = document.getElementById("cart-drawer");
    if (!root) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open-lock");
    if (cartView === "thanks") {
      cartView = "cart";
      renderCartContents();
    }
  }

  function setView(v) {
    cartView = v;
    renderCartContents();
  }

  function flashAdded(name) {
    let toast = document.getElementById("rayaa-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rayaa-toast";
      toast.className = "rayaa-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = `Added — ${name}`;
    toast.classList.add("is-on");
    clearTimeout(flashAdded._t);
    flashAdded._t = setTimeout(() => toast.classList.remove("is-on"), 1800);
  }

  function renderCartContents() {
    const root = document.getElementById("cart-drawer");
    if (!root) return;

    const body = root.querySelector("[data-cart-body]");
    const foot = root.querySelector("[data-cart-foot]");
    const titleEl = root.querySelector("[data-cart-title]");
    const eyebrowEl = root.querySelector("[data-cart-eyebrow]");
    if (!body || !foot) return;

    body.innerHTML = "";
    foot.innerHTML = "";

    if (cartView === "thanks") {
      eyebrowEl.textContent = "Order Confirmed";
      titleEl.textContent = "Thank you.";
      const order = lastOrder || { reference: "RC-000000", email: "" };
      body.innerHTML = `
        <div class="cart-thanks">
          <div class="cart-thanks-mark" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12l5 5L20 6"/>
            </svg>
          </div>
          <p class="lede">Thank you for purchasing from Rayaa &amp; Co.</p>
          <p class="cart-thanks-note">
            This is a placeholder confirmation — your order has been received.
            A note from the atelier will follow shortly with shipping details
            and a hand-signed care card.
          </p>
          <dl class="cart-thanks-meta">
            <div><dt>Reference</dt><dd>${escapeHTML(order.reference)}</dd></div>
            ${order.email ? `<div><dt>Email</dt><dd>${escapeHTML(order.email)}</dd></div>` : ""}
          </dl>
        </div>
      `;
      foot.innerHTML = `
        <button type="button" class="btn btn-maroon cart-foot-btn" data-cart-continue>Continue Browsing</button>
      `;
      foot.querySelector("[data-cart-continue]").addEventListener("click", () => closeCart());
      return;
    }

    if (cartView === "checkout") {
      eyebrowEl.textContent = "Checkout";
      titleEl.textContent = "Almost there.";
      const subtotal = cartSubtotal();
      const shipping = subtotal > 0 ? 60 : 0;
      const total = subtotal + shipping;
      body.innerHTML = `
        <form class="cart-checkout-form" id="cart-checkout-form" novalidate>
          <p class="cart-checkout-note">
            This is a demo checkout — no payment will be taken. Fill the fields
            below to receive a placeholder order confirmation.
          </p>

          <fieldset>
            <legend>Contact</legend>
            <label class="cart-field">
              <span>Email</span>
              <input name="email" type="email" required autocomplete="email" placeholder="you@example.com" />
            </label>
            <label class="cart-field">
              <span>Full name</span>
              <input name="name" type="text" required autocomplete="name" placeholder="Your name" />
            </label>
          </fieldset>

          <fieldset>
            <legend>Shipping</legend>
            <label class="cart-field">
              <span>Address</span>
              <input name="address" type="text" required autocomplete="street-address" placeholder="Street, building, apt" />
            </label>
            <div class="cart-field-row">
              <label class="cart-field">
                <span>City</span>
                <input name="city" type="text" required autocomplete="address-level2" placeholder="Dubai" />
              </label>
              <label class="cart-field">
                <span>Country</span>
                <input name="country" type="text" required autocomplete="country-name" placeholder="UAE" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Payment</legend>
            <p class="cart-payment-note">Card details are a placeholder — nothing is sent.</p>
            <label class="cart-field">
              <span>Card number</span>
              <input name="card" type="text" inputmode="numeric" placeholder="4242 4242 4242 4242" />
            </label>
            <div class="cart-field-row">
              <label class="cart-field">
                <span>Expiry</span>
                <input name="expiry" type="text" placeholder="MM / YY" />
              </label>
              <label class="cart-field">
                <span>CVC</span>
                <input name="cvc" type="text" inputmode="numeric" placeholder="123" />
              </label>
            </div>
          </fieldset>

          <div class="cart-totals">
            <div><span>Subtotal</span><span>${formatAED(subtotal)}</span></div>
            <div><span>Shipping</span><span>${shipping ? formatAED(shipping) : "—"}</span></div>
            <div class="cart-totals-grand"><span>Total</span><span>${formatAED(total)}</span></div>
          </div>
        </form>
      `;
      foot.innerHTML = `
        <button type="button" class="btn cart-foot-btn cart-foot-secondary" data-cart-back>Back to Cart</button>
        <button type="submit" form="cart-checkout-form" class="btn btn-maroon cart-foot-btn" data-cart-place>Place Order</button>
      `;
      foot.querySelector("[data-cart-back]").addEventListener("click", () => setView("cart"));
      const form = body.querySelector("#cart-checkout-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const required = ["email", "name", "address", "city", "country"];
        let ok = true;
        required.forEach((k) => {
          const input = form.querySelector(`[name="${k}"]`);
          if (!input.value.trim()) {
            input.classList.add("is-error");
            ok = false;
          } else {
            input.classList.remove("is-error");
          }
        });
        if (!ok) return;
        lastOrder = {
          reference: "RC-" + Math.floor(100000 + Math.random() * 900000),
          email: data.get("email"),
          name: data.get("name"),
          total: total,
        };
        clearCart();
        setView("thanks");
      });
      return;
    }

    // default: cart list
    eyebrowEl.textContent = "Your Cart";
    titleEl.textContent = "The Bag";

    const items = readCart();
    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <p class="lede">Your bag is quiet for now.</p>
          <p class="cart-empty-note">Each piece is hand-finished in our Dubai atelier. Start with the collection.</p>
          <a href="collection.html" class="btn btn-maroon">Explore Collection</a>
        </div>
      `;
      return;
    }

    const list = document.createElement("ul");
    list.className = "cart-list";
    items.forEach((i) => {
      const p = findProductById(i.id);
      if (!p) return;
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div class="cart-item-img">
          <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" decoding="async" />
          ${i.swatch ? `<span class="cart-item-swatch" style="background:${escapeAttr(i.swatch)}" aria-hidden="true"></span>` : ""}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-top">
            <div>
              <h3 class="cart-item-name">${escapeHTML(p.name)}</h3>
              <p class="cart-item-cat">${escapeHTML(p.category)}</p>
            </div>
            <button type="button" class="cart-item-remove" aria-label="Remove ${escapeAttr(p.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-qty" role="group" aria-label="Quantity for ${escapeAttr(p.name)}">
              <button type="button" class="cart-qty-btn" data-act="dec" aria-label="Decrease quantity">−</button>
              <span class="cart-qty-val">${i.qty}</span>
              <button type="button" class="cart-qty-btn" data-act="inc" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-item-price">${formatAED(p.price * i.qty)}</span>
          </div>
        </div>
      `;
      li.querySelector("[data-act='dec']").addEventListener("click", () =>
        updateQty(i.id, i.swatch, i.qty - 1),
      );
      li.querySelector("[data-act='inc']").addEventListener("click", () =>
        updateQty(i.id, i.swatch, i.qty + 1),
      );
      li.querySelector(".cart-item-remove").addEventListener("click", () =>
        removeFromCart(i.id, i.swatch),
      );
      list.appendChild(li);
    });
    body.appendChild(list);

    const subtotal = cartSubtotal();
    foot.innerHTML = `
      <div class="cart-foot-row">
        <span>Subtotal</span>
        <strong>${formatAED(subtotal)}</strong>
      </div>
      <p class="cart-foot-note">Shipping calculated at checkout.</p>
      <div class="cart-foot-actions">
        <button type="button" class="btn cart-foot-btn cart-foot-secondary" data-cart-clear>Clear Bag</button>
        <button type="button" class="btn btn-maroon cart-foot-btn" data-cart-checkout>Checkout</button>
      </div>
    `;
    foot.querySelector("[data-cart-clear]").addEventListener("click", () => {
      if (confirm("Clear all items from your bag?")) clearCart();
    });
    foot.querySelector("[data-cart-checkout]").addEventListener("click", () => setView("checkout"));
  }

  function attachCartTriggers() {
    document.querySelectorAll('.icon-btn[aria-label="Cart"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openCart();
      });
    });
  }

  /* ───────────────────────── Helpers ───────────────────────── */
  function escapeHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }
  function escapeAttr(s) {
    return escapeHTML(s);
  }

  /* ───────────────────────── Product card ───────────────────────── */
  function renderProductCard(p, priority) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.productId = p.id;

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

    const quickAdd = document.createElement("button");
    quickAdd.type = "button";
    quickAdd.className = "quick-add";
    quickAdd.setAttribute("aria-label", `Add ${p.name} to bag`);
    quickAdd.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      <span>Add</span>
    `;
    quickAdd.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeSwatch = article.querySelector(".swatch.is-active");
      const swatch = activeSwatch ? activeSwatch.style.background : null;
      addToCart(p.id, swatch, 1);
    });
    frame.appendChild(quickAdd);

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

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-maroon add-to-cart-btn";
    addBtn.innerHTML = `
      <span>Add to Bag</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    `;
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeSwatch = article.querySelector(".swatch.is-active");
      const swatch = activeSwatch ? activeSwatch.style.background : null;
      addToCart(p.id, swatch, 1);
    });
    article.appendChild(addBtn);

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

  /* ───────────────────────── Marquee ───────────────────────── */
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

  /* ───────────────────────── Journal teaser ───────────────────────── */
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

  /* ───────────────────────── Footer year ───────────────────────── */
  function setYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ───────────────────────── Forms ───────────────────────── */
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

  /* ───────────────────────── Init ───────────────────────── */
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
    injectCartDrawer();
    attachCartTriggers();
    updateCartBadges();
  }

  window.RAYAA = {
    renderProductGrid,
    renderMarquee,
    renderJournalTeaser,
    renderProductCard,
    addToCart,
    openCart,
    closeCart,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
