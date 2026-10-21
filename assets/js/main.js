/* =========================================================
   HWDI — Healing With Donnel Israel
   Interactions: navigation, reveals, pillar explorer,
   counters, join form → WhatsApp, micro-UX
   ========================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "254796967788";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     1. Scroll progress + sticky header behaviour
     --------------------------------------------------------- */
  var progressBar = $("#progressBar");
  var siteTop = $("#siteTop");
  var siteHeader = $("#siteHeader");
  var toTop = $("#toTop");
  var lastY = window.pageYOffset;
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? Math.min(100, Math.max(0, (y / docH) * 100)) : 0;

    if (progressBar) progressBar.style.width = pct + "%";
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", y > 12);
    if (siteTop) siteTop.classList.toggle("is-scrolled", y > 24);

    if (toTop) toTop.classList.toggle("is-visible", y > 700);

    // Hide the header on downward scroll, reveal on upward scroll.
    var navOpen = $("#primaryNav") && $("#primaryNav").classList.contains("is-open");
    if (siteTop && !navOpen) {
      if (y > 480 && y > lastY + 6) siteTop.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 480) siteTop.classList.remove("is-hidden");
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("load", onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------- */
  var nav = $("#primaryNav");
  var menuToggle = $("#menuToggle");

  function closeNav() {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("is-locked");
  }

  function openNav() {
    if (!nav || !menuToggle) return;
    if (siteTop) siteTop.classList.remove("is-hidden");
    nav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    if (window.innerWidth <= 1024) document.body.classList.add("is-locked");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    });
  }

  if (nav) {
    $$(".nav a", nav).forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) closeNav();
  });

  /* ---------------------------------------------------------
     3. Reveal on scroll
     --------------------------------------------------------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     4. Active section in navigation
     --------------------------------------------------------- */
  var navLinks = $$(".nav__link");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.getElementById(id.slice(1)) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------
     5. Pillar explorer (tabs + keyboard + deep links)
     --------------------------------------------------------- */
  var tabs = $$(".pillar-tab");
  var panels = $$(".pillar-panel");

  function activatePillar(key, opts) {
    if (!key) return false;
    var tab = document.getElementById("tab-" + key);
    var panel = document.getElementById("panel-" + key);
    if (!tab || !panel) return false;

    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.setAttribute("tabindex", selected ? "0" : "-1");
    });
    panels.forEach(function (p) {
      p.classList.toggle("is-active", p === panel);
    });

    if (opts && opts.focus) tab.focus();
    return true;
  }

  // Initial state
  if (panels.length) {
    var initial = null;
    if (window.location.hash && window.location.hash.indexOf("#pillar-") === 0) {
      initial = window.location.hash.replace("#pillar-", "");
    }
    if (!initial || !activatePillar(initial)) {
      var selectedTab = tabs.filter(function (t) {
        return t.getAttribute("aria-selected") === "true";
      })[0] || tabs[0];
      if (selectedTab) activatePillar(selectedTab.dataset.pillar);
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activatePillar(tab.dataset.pillar);
    });

    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activatePillar(next.dataset.pillar, { focus: true });
      }
    });
  });

  // Hero pillar bands open the matching pillar
  $$("[data-pillar-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      activatePillar(link.getAttribute("data-pillar-link"));
    });
  });

  // Allow "#pillar-talent" style links to work later in the session
  window.addEventListener("hashchange", function () {
    if (window.location.hash.indexOf("#pillar-") === 0) {
      activatePillar(window.location.hash.replace("#pillar-", ""));
    }
  });

  /* ---------------------------------------------------------
     6. Number counters
     --------------------------------------------------------- */
  var counters = $$("[data-count]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target; return; }

    var duration = 1100;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) window.requestAnimationFrame(step);
      else el.textContent = target;
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObserver.observe(c); });
  }

  /* ---------------------------------------------------------
     7. Toast helper
     --------------------------------------------------------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------------------------------------------------------
     8. Copy phone number
     --------------------------------------------------------- */
  var copyBtn = $("#copyPhone");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var value = copyBtn.getAttribute("data-copy") || "";
      var label = $("span", copyBtn);

      function done() {
        copyBtn.classList.add("is-copied");
        if (label) label.textContent = "Copied!";
        toast("Number copied — " + value);
        window.setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          if (label) label.textContent = "Copy number";
        }, 2200);
      }

      function fallback() {
        var temp = document.createElement("textarea");
        temp.value = value;
        temp.setAttribute("readonly", "");
        temp.style.position = "fixed";
        temp.style.top = "-1000px";
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand("copy"); done(); }
        catch (err) { toast("Could not copy. Number: " + value); }
        document.body.removeChild(temp);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------------------------------------------------------
     9. Join form → WhatsApp
     --------------------------------------------------------- */
  var form = $("#joinForm");
  var thanks = $("#joinThanks");
  var fallbackLink = $("#joinFallback");
  var resetBtn = $("#joinReset");

  function setError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    if (!input || !error) return;
    var field = input.closest(".field");
    error.textContent = message || "";
    if (field) field.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) {
      input.setAttribute("aria-describedby", errorId);
    } else {
      input.removeAttribute("aria-describedby");
    }
  }

  function buildMessage(name, interest, note) {
    var lines = [
      "Hi HWDI! I'd like to join the community.",
      "",
      "Name: " + name,
      "Interest: " + interest
    ];
    if (note) lines.push("Message: " + note);
    lines.push("", "Sent from the HWDI website.");
    return lines.join("\n");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameInput = $("#joinName");
      var interestInput = $("#joinInterest");
      var messageInput = $("#joinMessage");

      var name = nameInput.value.trim();
      var interest = interestInput.value;
      var note = messageInput.value.trim();
      var valid = true;

      if (name.length < 2) {
        setError("joinName", "nameError", "Please tell us your name.");
        valid = false;
      } else {
        setError("joinName", "nameError", "");
      }

      if (!interest) {
        setError("joinInterest", "interestError", "Choose what you're interested in.");
        valid = false;
      } else {
        setError("joinInterest", "interestError", "");
      }

      if (!valid) {
        var firstError = $(".field.has-error input, .field.has-error select");
        if (firstError) firstError.focus();
        return;
      }

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(buildMessage(name, interest, note));

      if (fallbackLink) fallbackLink.href = url;
      if (thanks) {
        form.hidden = true;
        thanks.hidden = false;
        thanks.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }

      window.open(url, "_blank", "noopener");
    });

    ["joinName", "joinInterest"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () {
        if (el.value.trim()) setError(id, id === "joinName" ? "nameError" : "interestError", "");
      });
      el.addEventListener("change", function () {
        if (el.value.trim()) setError(id, id === "joinName" ? "nameError" : "interestError", "");
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (thanks) thanks.hidden = true;
      if (form) {
        form.hidden = false;
        form.reset();
        setError("joinName", "nameError", "");
        setError("joinInterest", "interestError", "");
        var nameInput = $("#joinName");
        if (nameInput) nameInput.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     10. Footer year
     --------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) {
    var currentYear = new Date().getFullYear();
    yearEl.textContent = currentYear > 2026 ? currentYear : 2026;
  }

  /* Signal that progressive enhancement booted successfully */
  window.__hwdiReady = true;
})();
