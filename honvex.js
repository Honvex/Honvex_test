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
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) {
      // light stagger for siblings inside the same grid
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(idx, 5) * 0.08 + "s");
      io.observe(el);
    });
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
