/* ==========================================================
   Honvex Internationals – shared interactions (index + machinery)
   Every feature checks that its elements exist, so the same
   file works on all pages.
   ========================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  // Many Windows/Server setups report "reduce motion" even though the user wants animation,
  // so scroll effects always run. Add ?calm to the URL to switch off autoplay, parallax and tilt.
  var reduceMotion = /[?&]calm\b/.test(location.search);

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initScrollUI();
    initReveal();
    initSplit();
    initStatement();
    initRail();
    initCursor();
    initContactPanel();
    initWire();
    initSlider();
    initDots();
    initMobileBar();
    initTabs();
    initTilt();
    initCatalog();
    initTestimonials();
    initBuilder();
    initContactForm();
  });

  /* ---------- Phone-only bottom bar: call, email, enquire ---------- */
  function initMobileBar() {
    if (!$("#contact")) return;
    var bar = document.createElement("div");
    bar.className = "mbar";
    bar.innerHTML =
      '<a href="tel:+916382653163"><span>📞</span>Call</a>' +
      '<a href="mailto:info@honvexinternationals.com"><span>✉️</span>Email</a>' +
      '<a href="#contact" class="main"><span>💬</span>Enquire</a>';
    document.body.appendChild(bar);
  }

  /* ---------- Side section dots: shows where you are on the page ---------- */
  function initDots() {
    var targets = $$("[data-dot]").filter(function (t) { return t.id; });
    if (targets.length < 2) return;
    var nav = document.createElement("nav");
    nav.className = "dots";
    nav.setAttribute("aria-label", "Page sections");
    var links = targets.map(function (t) {
      var a = document.createElement("a");
      a.href = "#" + t.id;
      var label = document.createElement("span");
      label.textContent = t.dataset.dot;
      a.appendChild(label);
      nav.appendChild(a);
      return a;
    });
    document.body.appendChild(nav);

    var ticking = false;
    function update() {
      ticking = false;
      var line = window.scrollY + window.innerHeight * 0.4;
      var atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      var cur = atEnd ? targets.length - 1 : 0;
      if (!atEnd) targets.forEach(function (t, i) { if (t.getBoundingClientRect().top + window.scrollY <= line) cur = i; });
      links.forEach(function (a, i) {
        a.classList.toggle("active", i === cur);
        if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Organics: bulk enquiry builder ---------- */
  function initBuilder() {
    var box = $(".builder");
    if (!box) return;
    var chips = $$(".chip", box);
    var country = $("#b-country");
    var list = $(".b-list", box);
    var dest = $(".b-dest", box);
    var send = $(".b-send", box);

    function lines() {
      return chips.filter(function (c) { return c.classList.contains("on"); }).map(function (c) {
        var q = $(".chip-qty", c).value.trim();
        return { name: c.dataset.name, qty: q ? q + " " + $(".chip-unit", c).value : "quantity to be discussed" };
      });
    }
    function render() {
      var items = lines();
      list.innerHTML = "";
      if (!items.length) {
        var e = document.createElement("p");
        e.className = "b-empty";
        e.textContent = "Pick one or more products on the left to build your enquiry.";
        list.appendChild(e);
      }
      items.forEach(function (it) {
        var row = document.createElement("div");
        row.className = "b-row";
        var a = document.createElement("span"); a.textContent = it.name;
        var b = document.createElement("span"); b.textContent = it.qty;
        row.appendChild(a); row.appendChild(b);
        list.appendChild(row);
      });
      dest.textContent = country.value.trim() ? "Destination: " + country.value.trim() : "Destination: not set yet";
      send.disabled = !items.length;
      send.style.opacity = items.length ? 1 : .5;
    }

    chips.forEach(function (c) {
      $(".chip-btn", c).addEventListener("click", function () {
        c.classList.toggle("on");
        if (c.classList.contains("on")) $(".chip-qty", c).focus();
        render();
      });
      $$("input, select", c).forEach(function (f) { f.addEventListener("input", render); });
    });
    country.addEventListener("input", render);

    // Let catalog popups add a product to the builder as well
    document.addEventListener("honvex:add-to-builder", function (e) {
      chips.forEach(function (c) { if (c.dataset.name === e.detail) c.classList.add("on"); });
      render();
    });

    send.addEventListener("click", function () {
      var items = lines();
      if (!items.length) return;
      var ta = $(".form-textarea");
      var text = "Hello, I would like a quote for: " + items.map(function (i) { return i.name + " – " + i.qty; }).join("; ") + "." +
        (country.value.trim() ? " Destination: " + country.value.trim() + "." : "");
      if (ta) { ta.value = text; ta.dispatchEvent(new Event("input")); }
      var target = $("#contact");
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
    render();
  }

  /* ---------- Navigation: mobile menu + active link ---------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var links = $(".nav-links");
    if (!links) return;

    function setOpen(open) {
      links.classList.toggle("open", open);
      if (toggle) {
        toggle.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", String(open));
      }
    }
    if (toggle) toggle.addEventListener("click", function () { setOpen(!links.classList.contains("open")); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav")) setOpen(false);
    });

    // Highlight the link of the section currently in view (same-page links only)
    var navLinks = $$(".nav-link");
    var map = [];
    navLinks.forEach(function (a) {
      var url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) {
        var target = $(url.hash);
        if (target) map.push({ link: a, target: target });
      }
    });
    if (!map.length) return;

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY + 140;
      var current = null;
      map.forEach(function (m) { if (m.target.offsetTop <= y) current = m.link; });
      navLinks.forEach(function (a) { a.classList.toggle("active", a === current); });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Scroll progress, hide-on-scroll nav, back-to-top ---------- */
  function initScrollUI() {
    var nav = $(".nav");
    var bar = $(".progress");
    var topBtn = $(".to-top");
    var last = 0;
    var ticking = false;

    function update() {
      ticking = false;
      var st = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";
      if (topBtn) topBtn.classList.toggle("show", st > 600);
      if (nav) {
        nav.classList.toggle("scrolled", st > 10);
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    if (topBtn) topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    // cards and feature blocks fade in too, even where the HTML doesn't mark them
    $$(".card, .feature, .strip-item").forEach(function (el) { el.classList.add("reveal"); });
    var items = $$(".reveal");
    var icons = $$(".ico, .strip-item > span");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in", "done"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add("in");
        setTimeout(function () { el.classList.add("done"); }, 1200);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) {
      // light stagger for siblings inside the same row or grid
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(idx, 4) * 0.08 + "s");
      io.observe(el);
    });

    // icons hop once when they scroll into view
    var hopper = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        hopper.unobserve(en.target);
        setTimeout(function () { en.target.classList.add("hop"); }, 250);
      });
    }, { threshold: 0.6 });
    icons.forEach(function (el) { hopper.observe(el); });
  }

  /* ---------- Big word: letters rise one by one when it scrolls into view ---------- */
  function initSplit() {
    $$("[data-split]").forEach(function (el) {
      var text = el.textContent;
      el.textContent = "";
      text.split("").forEach(function (ch, i) {
        var s = document.createElement("span");
        s.textContent = ch;
        s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", i);
        el.appendChild(s);
      });
      if (!("IntersectionObserver" in window)) { el.classList.add("in"); return; }
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { el.classList.add("in"); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(el);
    });
  }

  /* ---------- Statement: words (and icons) fill in as you scroll past ---------- */
  function initStatement() {
    var el = $("[data-words]");
    if (!el) return;
    var items = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.className = "w";
          w.textContent = part;
          items.push(w);
          frag.appendChild(w);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) { items.push(node); }
    });
    var ticking = false;
    function update() {
      ticking = false;
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      var n = Math.round(p * items.length);
      items.forEach(function (it, i) { it.classList.toggle("on", i < n); });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Product rail: drag, arrows, progress bar ---------- */
  function initRail() {
    var rail = $(".rail");
    if (!rail) return;
    var bar = $(".rail-bar i");
    var prev = $(".rail-prev"), next = $(".rail-next");

    function progress() {
      var max = rail.scrollWidth - rail.clientWidth;
      var share = rail.clientWidth / rail.scrollWidth;
      if (bar) {
        bar.style.width = Math.max(12, share * 100) + "%";
        bar.style.marginLeft = (max > 0 ? (rail.scrollLeft / max) * (100 - Math.max(12, share * 100)) : 0) + "%";
      }
    }
    rail.addEventListener("scroll", progress, { passive: true });
    window.addEventListener("resize", progress);
    progress();

    function step(dir) {
      var card = $(".rail-card", rail);
      rail.scrollBy({ left: dir * (card ? card.offsetWidth + 20 : 300), behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });

    // mouse drag (touch screens already scroll natively)
    var down = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = 0; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) rail.classList.add("drag");
      rail.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      setTimeout(function () { rail.classList.remove("drag"); }, 0);
    });
    rail.addEventListener("click", function (e) {
      if (moved > 6) { e.preventDefault(); moved = 0; }
    }, true);
  }

  /* ---------- Custom cursor ring (mouse only) ---------- */
  function initCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var ring = document.createElement("div"); ring.className = "cursor";
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    var x = 0, y = 0, rx = 0, ry = 0, running = false;
    function loop() {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
      if (Math.abs(x - rx) > 0.3 || Math.abs(y - ry) > 0.3) requestAnimationFrame(loop); else running = false;
    }
    document.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      ring.classList.add("show"); dot.classList.add("show");
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    document.addEventListener("mouseleave", function () { ring.classList.remove("show"); dot.classList.remove("show"); });
    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle("big", !!e.target.closest("a, button, .rail-card, .product-card, .chip-btn, summary"));
    });
  }

  /* ---------- Floating contact button + slide-over panel ---------- */
  function initContactPanel() {
    var fab = document.createElement("button");
    fab.type = "button"; fab.className = "fab"; fab.innerHTML = "<span>💬</span> Contact";
    var ov = document.createElement("div"); ov.className = "cpanel-ov";
    var panel = document.createElement("aside");
    panel.className = "cpanel"; panel.setAttribute("aria-label", "Contact");
    panel.innerHTML =
      '<button type="button" class="cp-close" aria-label="Close">×</button>' +
      "<h3>Let's talk</h3><p>Tell us what you need and our team will get back to you.</p>" +
      '<a class="row" href="tel:+916382653163"><span>📞</span>+91 6382653163</a>' +
      '<a class="row" href="mailto:info@honvexinternationals.com"><span>✉️</span>info@honvexinternationals.com</a>' +
      '<a class="row" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Honvex+International+Salamedu+Viluppuram"><span>📍</span>NH-45 Trichy Highway Road, Salamedu, Viluppuram, Tamil Nadu - 605403</a>' +
      '<a class="row" href="#contact"><span>📝</span>Open the enquiry form</a>';
    document.body.appendChild(ov); document.body.appendChild(panel); document.body.appendChild(fab);
    function set(open) { document.body.classList.toggle("cp-open", open); }
    fab.addEventListener("click", function () { set(true); });
    ov.addEventListener("click", function () { set(false); });
    $(".cp-close", panel).addEventListener("click", function () { set(false); });
    panel.addEventListener("click", function (e) { if (e.target.closest('a[href="#contact"]')) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    if (!$("#contact")) $('a[href="#contact"]', panel).style.display = "none";
  }

  /* ---------- Wire timeline: an icon travels down the wire as you scroll ---------- */
  function initWire() {
    var box = $(".steps");
    if (!box) return;
    var steps = $$(".step", box);
    var wire = document.createElement("div");
    wire.className = "wire";
    wire.innerHTML = '<i class="wire-fill"></i>';
    var icon = document.createElement("div");
    icon.className = "wire-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = "<span>🚚</span>";
    box.appendChild(wire);
    box.appendChild(icon);
    var fill = $(".wire-fill", wire);

    var ticking = false;
    function update() {
      ticking = false;
      var r = box.getBoundingClientRect();
      var y = Math.min(r.height, Math.max(0, window.innerHeight * 0.55 - r.top));
      fill.style.height = y + "px";
      icon.style.top = y + "px";
      steps.forEach(function (s) { s.classList.toggle("lit", s.offsetTop + 40 <= y); });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Hero slider ---------- */
  function initSlider() {
    var root = $(".hero-slider");
    if (!root) return;
    var slides = $$(".slide", root);
    if (!slides.length) return;
    var dotsBox = $(".slider-dots", root);
    var idx = 0;
    var timer = null;
    var DELAY = 6000;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      if (dotsBox) dotsBox.appendChild(b);
      return b;
    });

    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("active", n === idx); });
      dots.forEach(function (d, n) { d.classList.toggle("active", n === idx); });
    }
    function start() { stop(); if (!reduceMotion && slides.length > 1) timer = setInterval(function () { go(idx + 1); }, DELAY); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { start(); }

    var next = $(".next", root), prev = $(".prev", root);
    if (next) next.addEventListener("click", function () { go(idx + 1); restart(); });
    if (prev) prev.addEventListener("click", function () { go(idx - 1); restart(); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    document.addEventListener("keydown", function (e) {
      var r = root.getBoundingClientRect();
      var inView = r.bottom > 0 && r.top < window.innerHeight;
      if (!inView || /input|textarea/i.test((e.target.tagName || ""))) return;
      if (e.key === "ArrowRight") { go(idx + 1); restart(); }
      if (e.key === "ArrowLeft") { go(idx - 1); restart(); }
    });

    // Swipe on touch screens
    var x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    }, { passive: true });

    go(0);
    start();
  }

  /* ---------- Machinery / Organics tabs (home page) ---------- */
  function initTabs() {
    var tabs = $$(".tab[data-tab]");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", String(on));
        });
        $$(".tab-panel").forEach(function (p) {
          p.classList.toggle("active", p.dataset.panel === tab.dataset.tab);
        });
      });
    });
  }

  /* ---------- 3D tilt on cards (mouse only) ---------- */
  function initTilt() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(800px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Machinery page: filter + search + detail popup ---------- */
  function initCatalog() {
    var grid = $("#catalog");
    if (!grid) return;
    var cards = $$(".product-card", grid);
    var filters = $$(".filter-btn");
    var search = $("#product-search");
    var empty = $(".empty");
    var category = "all";

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (c) {
        var okCat = category === "all" || c.dataset.category === category;
        var okQ = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
        var show = okCat && okQ;
        c.classList.toggle("hidden", !show);
        if (show) {
          shown++;
          c.classList.remove("show-anim");
          void c.offsetWidth; // restart the animation
          c.classList.add("show-anim");
        }
      });
      if (empty) empty.classList.toggle("show", shown === 0);
    }

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        category = btn.dataset.filter;
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);

    // Popup
    var dlg = $("#product-modal");
    if (!dlg || typeof dlg.showModal !== "function") return;
    var current = null;

    function open(card) {
      current = card;
      $(".m-tag", dlg).textContent = card.dataset.tag || "";
      $(".m-title", dlg).textContent = card.dataset.name || "";
      $(".m-desc", dlg).textContent = card.dataset.desc || "";
      $(".m-spec", dlg).textContent = card.dataset.spec || "";
      $(".modal-img", dlg).style.backgroundImage = "url('" + card.dataset.img + "')";
      dlg.showModal();
    }
    cards.forEach(function (c) {
      c.tabIndex = 0;
      c.setAttribute("role", "button");
      c.addEventListener("click", function () { open(c); });
      c.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(c); }
      });
    });
    $(".modal-close", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

    var add = $(".m-add", dlg);
    if (add) add.addEventListener("click", function () {
      document.dispatchEvent(new CustomEvent("honvex:add-to-builder", { detail: current.dataset.name }));
      dlg.close();
      var b = $("#builder");
      if (b) b.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });

    var enquire = $(".m-enquire", dlg);
    if (enquire) enquire.addEventListener("click", function () {
      var ta = $(".form-textarea");
      if (ta && current) {
        ta.value = "Hello, I would like a quote for: " + current.dataset.name + (current.dataset.spec ? " (" + current.dataset.spec + ")" : "") + ".";
        ta.dispatchEvent(new Event("input"));
      }
      dlg.close();
      var target = $("#contact");
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Testimonials ---------- */
  function initTestimonials() {
    var avatars = $$(".t-avatars .avatar");
    var quote = $(".t-quote");
    var author = $(".t-author");
    if (!avatars.length || !quote || !author) return;

    var data = [
      { text: "We've sourced spices and coconut products from Honvex for years. Their commitment to quality and ethical sourcing gives us complete confidence.", by: "CEO, Organic Trade Ltd." },
      { text: "Outstanding service and product quality! Highly recommend for global trade.", by: "Manager, Crane Supplies Inc." },
      { text: "Reliable, consistent, and professional team. Our trusted partner.", by: "Director, Global Export Co." },
      { text: "Fast delivery and excellent customer support.", by: "Head of Operations, Organic World Ltd." },
      { text: "Products meet the highest international standards.", by: "CEO, Premium Trade Ltd." },
      { text: "We trust them for all our bulk orders and exports.", by: "Procurement Head, Export Solutions Inc." }
    ];
    var idx = Math.max(0, avatars.findIndex(function (a) { return a.classList.contains("active"); }));
    var timer = null;

    function show(i) {
      idx = (i + data.length) % data.length;
      avatars.forEach(function (a, n) {
        a.classList.toggle("active", n === idx);
        a.setAttribute("aria-pressed", String(n === idx));
      });
      quote.classList.add("t-fade");
      author.classList.add("t-fade");
      setTimeout(function () {
        quote.textContent = data[idx].text;
        author.textContent = "— " + data[idx].by;
        quote.classList.remove("t-fade");
        author.classList.remove("t-fade");
      }, reduceMotion ? 0 : 300);
    }
    function start() { stop(); if (!reduceMotion) timer = setInterval(function () { show(idx + 1); }, 7000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    avatars.forEach(function (a, i) {
      a.tabIndex = 0;
      a.setAttribute("role", "button");
      a.addEventListener("click", function () { show(i); start(); });
      a.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i); start(); }
      });
    });
    var box = $(".t-wrap");
    if (box) {
      box.addEventListener("mouseenter", stop);
      box.addEventListener("mouseleave", start);
    }
    show(idx);
    start();
  }

  /* ---------- Contact form (EmailJS) ---------- */
  function initContactForm() {
    var form = $(".contact-form");
    if (!form) return;
    var status = $(".form-status", form);
    var btn = $(".form-button", form);
    var area = $(".form-textarea", form);
    var counter = $(".char-count", form);
    var MAX = 1000;

    if (window.emailjs) emailjs.init({ publicKey: "TPVcA2JCjDhf7Ld6_" });

    function say(kind, msg) {
      status.className = "form-status " + kind;
      status.textContent = msg;
    }
    if (area && counter) {
      area.maxLength = MAX;
      area.addEventListener("input", function () { counter.textContent = area.value.length + " / " + MAX; });
    }
    $$("input, textarea", form).forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = $$("[required]", form).filter(function (f) {
        var ok = f.value.trim() !== "" && f.checkValidity();
        f.classList.toggle("invalid", !ok);
        return !ok;
      });
      if (bad.length) { bad[0].focus(); return say("err", "Please fill in the highlighted fields."); }
      if (!window.emailjs) return say("err", "Email service could not be loaded. Please email us at info@honvexinternationals.com.");

      var v = function (name) { return form.elements[name].value.trim(); };
      var params = {
        from_name: v("name"),
        from_email: v("email"),
        company: v("company"),
        country: v("country"),
        message: v("message")
      };

      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = "SENDING…";
      emailjs.send("service_vrd8rkv", "honvex_123", params).then(function () {
        say("ok", "Thank you! Your message was sent. We'll get back to you soon.");
        form.reset();
        if (counter) counter.textContent = "0 / " + MAX;
      }, function (err) {
        console.error("EmailJS Error:", JSON.stringify(err));
        say("err", "Sorry, the message could not be sent. Please try again or email info@honvexinternationals.com.");
      }).then(function () {
        btn.disabled = false;
        btn.textContent = label;
      });
    });
  }
})();
